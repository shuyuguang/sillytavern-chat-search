(function () {
    // 防止重复加载
    if (document.getElementById('chat-search-bar')) {
        return;
    }

    // --- 状态变量 ---
    let searchResults = []; // 存储找到的DOM元素
    let currentIndex = -1; // 当前高亮结果的索引

    // --- 创建UI元素 ---
    const searchBar = document.createElement('div');
    searchBar.id = 'chat-search-bar';
    searchBar.classList.add('hidden'); // 初始状态隐藏

    const cancelBtn = document.createElement('div');
    cancelBtn.id = 'search-cancel';
    cancelBtn.textContent = '取消';

    const searchInput = document.createElement('input');
    searchInput.id = 'search-input';
    searchInput.type = 'text';
    searchInput.placeholder = '查找聊天记录...';

    const counter = document.createElement('div');
    counter.id = 'search-counter';
    counter.textContent = '0/0';

    const prevBtn = document.createElement('div');
    prevBtn.id = 'search-prev';
    prevBtn.classList.add('search-nav-button', 'disabled');
    prevBtn.innerHTML = '&#9650;'; // 上箭头 ▲

    const nextBtn = document.createElement('div');
    nextBtn.id = 'search-next';
    nextBtn.classList.add('search-nav-button', 'disabled');
    nextBtn.innerHTML = '&#9660;'; // 下箭头 ▼

    searchBar.append(cancelBtn, searchInput, counter, prevBtn, nextBtn);
    document.body.appendChild(searchBar);

    // --- 插件激活按钮 ---
    const openSearchButton = document.createElement('div');
    openSearchButton.classList.add('fa-solid', 'fa-magnifying-glass', 'fa-fw', 'extension-button');
    openSearchButton.title = 'Search in chat';
    document.getElementById('extensions_buttons').appendChild(openSearchButton);

    // --- 函数 ---

    function showSearchBar() {
        searchBar.classList.remove('hidden');
        searchInput.focus();
    }

    function hideSearchBar() {
        searchBar.classList.add('hidden');
        clearSearch();
    }

    function clearSearch() {
        // 移除所有高亮
        document.querySelectorAll('.search-highlight').forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize(); // 合并相邻的文本节点
        });
        searchResults = [];
        currentIndex = -1;
        searchInput.value = '';
        updateUI();
    }
    
    function performSearch() {
        clearSearch();
        const keyword = searchInput.value.trim();
        if (keyword === '') return;

        const chatMessages = document.querySelectorAll('#chat .mes_text');
        const regex = new RegExp(`(${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');

        chatMessages.forEach(msgElement => {
            if (msgElement.textContent.toLowerCase().includes(keyword.toLowerCase())) {
                const originalHTML = msgElement.innerHTML;
                const newHTML = originalHTML.replace(regex, '<span class="search-highlight">$1</span>');
                msgElement.innerHTML = newHTML;
            }
        });

        searchResults = Array.from(document.querySelectorAll('.search-highlight'));
        if (searchResults.length > 0) {
            currentIndex = 0;
            navigateToResult(0);
        }
        updateUI();
    }

    function navigateToResult(newIndex) {
        if (searchResults.length === 0) return;

        // 移除旧的 'current' 状态
        if (currentIndex !== -1 && searchResults[currentIndex]) {
            searchResults[currentIndex].classList.remove('current');
        }

        currentIndex = newIndex;

        // 添加新的 'current' 状态
        const currentElement = searchResults[currentIndex];
        if (currentElement) {
            currentElement.classList.add('current');
            currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        updateUI();
    }

    function updateUI() {
        counter.textContent = searchResults.length > 0 ? `${currentIndex + 1}/${searchResults.length}` : '0/0';
        
        if (searchResults.length > 1) {
            prevBtn.classList.remove('disabled');
            nextBtn.classList.remove('disabled');
        } else {
            prevBtn.classList.add('disabled');
            nextBtn.classList.add('disabled');
        }
    }

    // --- 事件监听 ---

    openSearchButton.addEventListener('click', showSearchBar);
    cancelBtn.addEventListener('click', hideSearchBar);

    searchInput.addEventListener('input', performSearch);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextBtn.click();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (searchResults.length > 0) {
            const newIndex = (currentIndex + 1) % searchResults.length;
            navigateToResult(newIndex);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (searchResults.length > 0) {
            const newIndex = (currentIndex - 1 + searchResults.length) % searchResults.length;
            navigateToResult(newIndex);
        }
    });

    // 在切换聊天时重置搜索
    $(document).on('chatloaded.chatsearch chatswitched.chatsearch', hideSearchBar);

    console.log('Chat Search plugin loaded!');
})();
