document.addEventListener('DOMContentLoaded', () => {
    // 查找悬浮草稿按钮并添加事件监听器
    const draftsFloatingBtn = document.querySelector('.drafts-floating-btn');
    if (draftsFloatingBtn) {
        draftsFloatingBtn.addEventListener('click', () => {
            // 检查用户是否已登录
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                alert('You must be logged in to view drafts.');
                return;
            }

            // 动态加载草稿加载函数(如果函数不在当前作用域)
            if (typeof loadUserDrafts === 'function') {
                loadUserDrafts();
            } else {
                // 如果函数不可用，直接发起请求加载草稿
                fetch('https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/drafts', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to load drafts');
                    }
                    return response.json();
                })
                .then(drafts => {
                    // 显示草稿列表
                    displayDraftsList(drafts);
                })
                .catch(error => {
                    console.error('Error loading drafts:', error);
                    alert('Failed to load drafts. Please try again.');
                });
            }
        });
    }
});

// 显示草稿列表的辅助函数
function displayDraftsList(drafts) {
    // 创建草稿列表对话框
    const draftsDialog = document.createElement('div');
    draftsDialog.classList.add('your-drafts-modal');

    let draftsHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h5>Your Drafts</h5>
                <button type="button" class="close" id="closeYourDraftsModal">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
    `;

    if (drafts.length === 0) {
        draftsHTML += `<p>You don't have any saved drafts yet.</p>`;
    } else {
        draftsHTML += `<ul class="list-group">`;
        drafts.forEach(draft => {
            draftsHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center" data-draft-id="${draft._id}">
                    <span>${draft.name}</span>
                    <div>
                        <button class="btn btn-sm btn-primary edit-draft-btn">Edit</button>
                        <button class="btn btn-sm btn-danger delete-draft-btn">Delete</button>
                    </div>
                </li>
            `;
        });
        draftsHTML += `</ul>`;
    }

    draftsHTML += `</div></div>`;
    draftsDialog.innerHTML = draftsHTML;

    document.body.appendChild(draftsDialog);

    // 添加事件监听器
    document.getElementById('closeYourDraftsModal').addEventListener('click', () => {
        draftsDialog.remove();
    });

    const editButtons = document.querySelectorAll('.edit-draft-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const draftId = e.target.closest('li').dataset.draftId;
            window.location.href = `/editor.html?draft=${draftId}`;
        });
    });

    const deleteButtons = document.querySelectorAll('.delete-draft-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            if (confirm('Are you sure you want to delete this draft?')) {
                const listItem = e.target.closest('li');
                const draftId = listItem.dataset.draftId;
                const authToken = localStorage.getItem('authToken');

                try {
                    const response = await fetch(`https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/drafts/${draftId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to delete draft');
                    }

                    listItem.remove();

                    if (document.querySelectorAll('.list-group-item').length === 0) {
                        document.querySelector('.modal-body').innerHTML = `<p>You don't have any saved drafts yet.</p>`;
                    }

                } catch (error) {
                    console.error('Error deleting draft:', error);
                    alert('Failed to delete draft. Please try again.');
                }
            }
        });
    });

    // 添加样式
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
        .your-drafts-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .your-drafts-modal .modal-content {
            background-color: white;
            border-radius: 5px;
            width: 80%;
            max-width: 600px;
        }
        
        .your-drafts-modal .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .your-drafts-modal .modal-body {
            padding: 15px;
            max-height: 60vh;
            overflow-y: auto;
        }
    `;
    document.head.appendChild(modalStyles);
}