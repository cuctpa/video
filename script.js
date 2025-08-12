document.addEventListener('DOMContentLoaded', function() {
    // Добавляем анимации при загрузке страницы
    animatePageLoad();
    
    // Загружаем отзывы при загрузке страницы
    loadReviews();

    // Обработчик отправки формы
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendReview();
        });
    }
});

// Анимация загрузки страницы
function animatePageLoad() {
    const elementsToAnimate = [
        { selector: 'h1', animation: 'fadeInDown' },
        { selector: '.subtitle', animation: 'fadeIn', delay: 0.3 },
        { selector: '#reviewForm', animation: 'fadeInUp', delay: 0.6 },
        { selector: '#reviewsContainer', animation: 'fadeIn', delay: 0.9 }
    ];

    elementsToAnimate.forEach(item => {
        const element = document.querySelector(item.selector);
        if (element) {
            element.style.opacity = '0';
            element.style.animation = `${item.animation} 0.6s ease-out ${item.delay || 0}s forwards`;
        }
    });

    // Добавляем CSS для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeInDown {
            from { 
                opacity: 0;
                transform: translateY(-20px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes fadeInUp {
            from { 
                opacity: 0;
                transform: translateY(20px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        .review-item {
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.5s ease-out forwards;
        }
    `;
    document.head.appendChild(style);
}

// Функция отправки отзыва с анимациями
async function sendReview() {
    const nameInput = document.querySelector('input[name="name"]');
    const reviewInput = document.querySelector('textarea[name="review"]');
    const submitBtn = document.querySelector('button[type="submit"]');
    const form = document.getElementById('reviewForm');

    // Проверка заполнения полей с анимацией
    if (!nameInput.value.trim() || !reviewInput.value.trim()) {
        showError('Пожалуйста, заполните все поля');
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
        return;
    }

    // Блокируем кнопку во время отправки
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Отправка...';

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: nameInput.value.trim(),
                review: reviewInput.value.trim()
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка сервера');
        }

        const result = await response.json();
        showSuccess('Отзыв успешно отправлен!');
        
        // Анимация успешной отправки
        form.style.transform = 'scale(0.98)';
        setTimeout(() => {
            form.style.transform = 'scale(1)';
            form.style.transition = 'transform 0.3s ease';
        }, 100);

        // Очищаем форму и обновляем список отзывов
        nameInput.value = '';
        reviewInput.value = '';
        loadReviews();

    } catch (error) {
        console.error('Ошибка отправки отзыва:', error);
        showError('Не удалось отправить отзыв: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить';
    }
}

// Функция загрузки отзывов с анимациями
async function loadReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    if (!reviewsContainer) return;

    // Анимация загрузки
    reviewsContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Загрузка отзывов...</p>
        </div>
    `;

    try {
        const response = await fetch('/api/reviews');
        if (!response.ok) throw new Error('Ошибка загрузки отзывов');

        const reviews = await response.json();

        if (!reviews || reviews.length === 0) {
            reviewsContainer.innerHTML = '<p class="no-reviews">Пока нет отзывов. Будьте первым!</p>';
            return;
        }

        // Очищаем контейнер с анимацией
        reviewsContainer.style.opacity = '0';
        setTimeout(() => {
            reviewsContainer.innerHTML = '';
            reviewsContainer.style.opacity = '1';
            
            // Добавляем отзывы с последовательной анимацией
            reviews.forEach((review, index) => {
                const reviewElement = document.createElement('div');
                reviewElement.className = 'review-item';
                reviewElement.style.animationDelay = `${index * 0.1}s`;
                reviewElement.innerHTML = `
                    <h4>${escapeHtml(review.name)}</h4>
                    <p>${escapeHtml(review.review)}</p>
                    <small>${formatDate(review.date)}</small>
                `;
                reviewsContainer.appendChild(reviewElement);
            });
        }, 300);

    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        reviewsContainer.innerHTML = `
            <div class="error-message animate__animated animate__shakeX">
                Ошибка загрузки отзывов. Пожалуйста, попробуйте позже.
            </div>
        `;
    }
}

// Вспомогательные функции с анимациями
function showError(message) {
    const errorElement = document.getElementById('errorMessage') || createMessageElement('errorMessage');
    errorElement.textContent = message;
    errorElement.className = 'error-message animate__animated animate__shakeX';
    errorElement.style.display = 'block';
    
    setTimeout(() => {
        errorElement.style.opacity = '1';
    }, 10);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        errorElement.style.opacity = '0';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 300);
    }, 5000);
}

function showSuccess(message) {
    const successElement = document.getElementById('successMessage') || createMessageElement('successMessage');
    successElement.textContent = message;
    successElement.className = 'success-message animate__animated animate__fadeIn';
    successElement.style.display = 'block';
    
    setTimeout(() => {
        successElement.style.opacity = '1';
    }, 10);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        successElement.style.opacity = '0';
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 300);
    }, 3000);
}

function createMessageElement(id) {
    const element = document.createElement('div');
    element.id = id;
    element.style.opacity = '0';
    element.style.transition = 'opacity 0.3s ease';
    document.body.prepend(element);
    return element;
}

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    /* Основные стили анимаций */
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    /* Стили для спиннера загрузки */
    .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
        margin-right: 8px;
        vertical-align: middle;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .loading-spinner {
        text-align: center;
        padding: 20px;
    }
    
    .loading-spinner .spinner {
        width: 30px;
        height: 30px;
        border-width: 3px;
        margin: 0 auto 10px;
        display: block;
    }
    
    /* Дополнительные анимации для отзывов */
    .review-item {
        border: 1px solid #ddd;
        padding: 15px;
        margin-bottom: 10px;
        border-radius: 5px;
        background: #f9f9f9;
        transition: all 0.3s ease;
    }
    
    .review-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    /* Анимации для сообщений */
    .error-message, .success-message {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 1000;
        max-width: 80%;
        text-align: center;
        opacity: 0;
    }
    
    .error-message {
        background: #ffebee;
        color: #c62828;
        border: 1px solid #ef9a9a;
    }
    
    .success-message {
        background: #e8f5e9;
        color: #2e7d32;
        border: 1px solid #a5d6a7;
    }
    
    /* Анимация для формы */
    #reviewForm {
        transition: all 0.3s ease;
    }
    
    #reviewForm input, #reviewForm textarea {
        transition: all 0.3s ease;
    }
    
    #reviewForm input:focus, #reviewForm textarea:focus {
        transform: scale(1.02);
        box-shadow: 0 0 0 2px rgba(78,84,200,0.2);
    }
`;
document.head.appendChild(style);

// Остальные вспомогательные функции без изменений
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}
