document.addEventListener('DOMContentLoaded', function() {
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

// Функция отправки отзыва
async function sendReview() {
    const nameInput = document.querySelector('input[name="name"]');
    const reviewInput = document.querySelector('textarea[name="review"]');
    const submitBtn = document.querySelector('button[type="submit"]');

    // Проверка заполнения полей
    if (!nameInput.value.trim() || !reviewInput.value.trim()) {
        showError('Пожалуйста, заполните все поля');
        return;
    }

    // Блокируем кнопку во время отправки
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

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

// Функция загрузки отзывов
async function loadReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    console.log('Начало загрузки отзывов');

    try {
        const response = await fetch('/api/reviews');
        console.log('Ответ сервера:', response);

        if (!response.ok) throw new Error('Ошибка загрузки отзывов');

        const reviews = await response.json();
        console.log('Полученные отзывы:', reviews);

        if (reviewsContainer) {
            if (!reviews || reviews.length === 0) {
                reviewsContainer.innerHTML = '<p>Пока нет отзывов. Будьте первым!</p>';
                return;
            }

            reviewsContainer.innerHTML = ''; // Очищаем контейнер

            reviews.forEach(function(review) {
                const reviewElement = document.createElement('div');
                reviewElement.className = 'review-item';
                reviewElement.innerHTML = `
          <h4>${escapeHtml(review.name)}</h4>
          <p>${escapeHtml(review.review)}</p>
          <small>${formatDate(review.date)}</small>
        `;
                reviewsContainer.appendChild(reviewElement);
            });
        }
    } catch (error) {
        console.error('Полная ошибка:', error);
        if (reviewsContainer) {
            reviewsContainer.innerHTML = '<p class="error">Ошибка загрузки отзывов. Пожалуйста, попробуйте позже.</p>';
        }
    }
}

// Вспомогательные функции
function showError(message) {
    const errorElement = document.getElementById('errorMessage') || createMessageElement('errorMessage');
    errorElement.textContent = message;
    errorElement.className = 'error-message';
}

function showSuccess(message) {
    const successElement = document.getElementById('successMessage') || createMessageElement('successMessage');
    successElement.textContent = message;
    successElement.className = 'success-message';
}

function createMessageElement(id) {
    const element = document.createElement('div');
    element.id = id;
    document.body.prepend(element);
    return element;
}

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

// Добавляем базовые стили динамически
const style = document.createElement('style');
style.textContent = `
  .review-item {
    border: 1px solid #ddd;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 5px;
    background: #f9f9f9;
  }
  .error-message {
    color: red;
    padding: 10px;
    background: #ffeeee;
    border: 1px solid red;
    border-radius: 4px;
    margin: 10px 0;
  }
  .success-message {
    color: green;
    padding: 10px;
    background: #eeffee;
    border: 1px solid green;
    border-radius: 4px;
    margin: 10px 0;
  }
  #reviewForm {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 500px;
    margin: 20px 0;
  }
  #reviewForm input, #reviewForm textarea {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  #reviewForm button {
    padding: 10px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  #reviewForm button:disabled {
    background: #cccccc;
  }
`;
document.head.appendChild(style);