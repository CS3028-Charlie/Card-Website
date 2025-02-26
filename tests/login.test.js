// To run these tests, you need to have Node.js and npm installed. Follow these steps:
// 1. Install Mocha and Chai:
//    npm install mocha chai sinon jsdom node-fetch
// 2. Run the Tests:
//    npx mocha tests/login.test.js

const { JSDOM } = require('jsdom');
const sinon = require('sinon');

describe('Login System', () => {
    let document;
    let window;
    let expect;
    let fetch;
    let handleLogin, handleSignup, handleSignOut, showLoginSignupModal;

    before(async () => {
        const chai = await import('chai');
        expect = chai.expect;
        fetch = (await import('node-fetch')).default;
        global.fetch = fetch;
    });

    beforeEach(() => {
        const dom = new JSDOM(`<!DOCTYPE html><html><body>
            <div id="accountText"></div>
            <div id="accountIcon"></div>
            <div id="signOutFooter" style="display: none;"></div>
            <div id="accountModal"></div>
            <form id="loginForm"></form>
            <form id="signupForm"></form>
            <div id="userAccountSection"></div>
            <div id="usernameDisplay"></div>
            <div id="balanceDisplay"></div>
            <div id="topupSection"></div>
            <div id="classroomButton"></div>
            <div id="topupEmail"></div>
            <div id="topupStatus"></div>
            <button id="topupButton"></button>
            <input type="email" id="loginEmail">
            <input type="password" id="loginPassword">
            <input type="text" id="signupUsername">
            <input type="email" id="signupEmail">
            <input type="password" id="signupPassword">
            <select id="signupRole">
                <option value="parent">Parent</option>
                <option value="teacher">Teacher</option>
                <option value="pupil">Student</option>
            </select>
        </body></html>`, { url: "http://localhost" });

        window = dom.window;
        document = window.document;

        global.document = document;
        global.window = window;
        global.localStorage = {
            getItem: sinon.stub(),
            setItem: sinon.stub(),
            removeItem: sinon.stub()
        };

        global.alert = sinon.stub();
        global.$ = sinon.stub().returns({ modal: sinon.stub() });
        global.location = { reload: sinon.stub() };

        const loginModule = require('../public/Scripts/login.js');
        handleLogin = loginModule.handleLogin;
        handleSignup = loginModule.handleSignup;
        handleSignOut = loginModule.handleSignOut;
        showLoginSignupModal = loginModule.showLoginSignupModal;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should show login modal when accountText is clicked', () => {
        const accountText = document.getElementById('accountText');
        if (accountText) {
            accountText.click();
            showLoginSignupModal();
            expect(document.getElementById('loginForm').style.display).to.equal('block');
            expect(document.getElementById('signupForm').style.display).to.equal('block');
            expect(document.getElementById('userAccountSection').style.display).to.equal('none');
        }
    });

    it('should handle login correctly', async () => {
        const email = 'test@example.com';
        const password = 'password';
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = password;

        const response = {
            ok: true,
            json: async () => ({ username: 'testuser', role: 'pupil', token: 'token', balance: 100 })
        };
        sinon.stub(global, 'fetch').resolves(response);

        await handleLogin();

        expect(localStorage.setItem.calledWith('username', 'testuser')).to.be.true;
        expect(localStorage.setItem.calledWith('role', 'pupil')).to.be.true;
        expect(localStorage.setItem.calledWith('authToken', 'token')).to.be.true;
        expect(localStorage.setItem.calledWith('balance', 100)).to.be.true;
        expect(global.location.reload.calledOnce).to.be.true;
    });

    it('should handle signup correctly', async () => {
        const username = 'testuser';
        const email = 'test@example.com';
        const password = 'password';
        const role = 'pupil';
        document.getElementById('signupUsername').value = username;
        document.getElementById('signupEmail').value = email;
        document.getElementById('signupPassword').value = password;
        document.getElementById('signupRole').value = role;

        const response = {
            ok: true,
            json: async () => ({ token: 'token' })
        };
        sinon.stub(global, 'fetch').resolves(response);

        await handleSignup();

        expect(localStorage.setItem.calledWith('authToken', 'token')).to.be.true;
        expect(localStorage.setItem.calledWith('username', username)).to.be.true;
        expect(localStorage.setItem.calledWith('role', role)).to.be.true;
        expect(global.location.reload.calledOnce).to.be.true;
    });

    it('should handle sign out correctly', () => {
        handleSignOut();

        expect(localStorage.removeItem.calledWith('username')).to.be.true;
        expect(localStorage.removeItem.calledWith('role')).to.be.true;
        expect(localStorage.removeItem.calledWith('balance')).to.be.true;
        expect(localStorage.removeItem.calledWith('authToken')).to.be.true;
        expect(global.location.reload.calledOnce).to.be.true;
    });
});
