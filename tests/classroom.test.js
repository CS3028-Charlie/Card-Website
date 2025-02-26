// To run these tests, you need to have Node.js and npm installed. Follow these steps:
// 1. Install Mocha and Chai:
//    npm install mocha chai sinon jsdom node-fetch
// 2. Run the Tests:
//    npx mocha tests/classroom.test.js

const { JSDOM } = require('jsdom');
const sinon = require('sinon');

describe('Classroom System', () => {
    let document;
    let window;
    let expect;
    let fetch;
    let loadStudents, addStudentToClass, addCreditsToSelected, removeSelectedStudents, withdrawCreditsFromSelected;

    before(async () => {
        const chai = await import('chai');
        expect = chai.expect;
        fetch = (await import('node-fetch')).default;
        global.fetch = fetch;
    });

    beforeEach(() => {
        const dom = new JSDOM(`<!DOCTYPE html><html><body>
            <div id="teacherWelcome"></div>
            <div id="studentTableBody"></div>
            <input type="email" id="studentEmail">
            <div id="addStudentStatus"></div>
            <div id="creditStatus"></div>
            <div id="removeStudentStatus"></div>
            <div id="withdrawStatus"></div>
            <button id="addStudentButton"></button>
            <button id="addCreditsButton"></button>
            <button id="removeStudentsButton"></button>
            <button id="withdrawCreditsButton"></button>
            <input type="checkbox" id="selectAll">
            <div id="notificationsPanel"></div>
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
        global.confirm = sinon.stub().returns(true);
        global.updateUserUI = sinon.stub();

        const classroomModule = require('../public/Scripts/classroom.js');
        loadStudents = classroomModule.loadStudents;
        addStudentToClass = classroomModule.addStudentToClass;
        addCreditsToSelected = classroomModule.addCreditsToSelected;
        removeSelectedStudents = classroomModule.removeSelectedStudents;
        withdrawCreditsFromSelected = classroomModule.withdrawCreditsFromSelected;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should load students correctly', async () => {
        const students = [
            { email: 'student1@example.com', username: 'student1', balance: 100 },
            { email: 'student2@example.com', username: 'student2', balance: 200 }
        ];
        const response = {
            ok: true,
            json: async () => students
        };
        sinon.stub(global, 'fetch').resolves(response);

        await loadStudents();

        const tableBody = document.getElementById('studentTableBody');
        expect(tableBody.children.length).to.equal(students.length);
    });

    it('should add a student correctly', async () => {
        const studentEmail = 'student@example.com';
        document.getElementById('studentEmail').value = studentEmail;

        const response = {
            ok: true,
            json: async () => ({ message: 'Student added successfully' })
        };
        sinon.stub(global, 'fetch').resolves(response);

        await addStudentToClass();

        expect(document.getElementById('addStudentStatus').textContent).to.include('Student added successfully');
    });

    it('should add credits to selected students correctly', async () => {
        const selectedStudents = ['student1@example.com', 'student2@example.com'];
        selectedStudents.forEach((email, index) => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'studentCheckbox';
            checkbox.dataset.email = email;
            checkbox.checked = true;
            document.getElementById('studentTableBody').appendChild(checkbox);
        });

        const response = {
            ok: true,
            json: async () => ({ message: 'Credits added successfully' })
        };
        sinon.stub(global, 'fetch').resolves(response);

        await addCreditsToSelected();

        expect(document.getElementById('creditStatus').textContent).to.include('Credits added successfully');
    });

    it('should remove selected students correctly', async () => {
        const selectedStudents = ['student1@example.com', 'student2@example.com'];
        selectedStudents.forEach((email, index) => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'studentCheckbox';
            checkbox.dataset.email = email;
            checkbox.checked = true;
            document.getElementById('studentTableBody').appendChild(checkbox);
        });

        const response = {
            ok: true,
            json: async () => ({ message: 'Students removed successfully' })
        };
        sinon.stub(global, 'fetch').resolves(response);

        await removeSelectedStudents();

        expect(document.getElementById('removeStudentStatus').textContent).to.include('Students removed successfully');
    });

    it('should withdraw credits from selected students correctly', async () => {
        const selectedStudents = ['student1@example.com', 'student2@example.com'];
        selectedStudents.forEach((email, index) => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'studentCheckbox';
            checkbox.dataset.email = email;
            checkbox.checked = true;
            document.getElementById('studentTableBody').appendChild(checkbox);
        });

        const response = {
            ok: true,
            json: async () => ({ message: 'Credits withdrawn successfully' })
        };
        sinon.stub(global, 'fetch').resolves(response);

        await withdrawCreditsFromSelected();

        expect(document.getElementById('withdrawStatus').textContent).to.include('Credits withdrawn successfully');
    });
});
