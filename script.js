// 絶対あきらめない！大人の英語塾 - JavaScript

// DOM読み込み完了時の処理
document.addEventListener('DOMContentLoaded', function () {
    // モバイルメニューの制御
    initMobileMenu();

    // フォームバリデーションの初期化（お問い合わせページのみ）
    if (document.getElementById('contact-form')) {
        initFormValidation();
    }

    // アクティブなナビゲーションリンクのハイライト
    highlightActiveNav();
});

// モバイルメニューの初期化
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navigation = document.getElementById('navigation');

    if (mobileMenuBtn && navigation) {
        mobileMenuBtn.addEventListener('click', function () {
            navigation.classList.toggle('active');
        });

        // ナビゲーションリンククリック時にメニューを閉じる
        const navLinks = navigation.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 768) {
                    navigation.classList.remove('active');
                }
            });
        });

        // ウィンドウリサイズ時の処理
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) {
                navigation.classList.remove('active');
            }
        });
    }
}

// フォームバリデーションの初期化
function initFormValidation() {
    const form = document.getElementById('contact-form');
    const emailInput = document.getElementById('email');
    const nameInput = document.getElementById('name');
    const messageInput = document.getElementById('message');
    const emailError = document.getElementById('email-error');
    const nameError = document.getElementById('name-error');
    const messageError = document.getElementById('message-error');
    const recaptchaError = document.getElementById('recaptcha-error');
    // 初期表示でエラーメッセージを出さないよう非表示にしておく
    if (recaptchaError) {
        hideError(recaptchaError);
    }

    // リアルタイムバリデーション
    if (emailInput) {
        emailInput.addEventListener('blur', function () {
            validateEmail();
        });

        emailInput.addEventListener('input', function () {
            if (emailError.textContent) {
                validateEmail();
            }
        });
    }

    if (nameInput) {
        nameInput.addEventListener('blur', function () {
            validateName();
        });

        nameInput.addEventListener('input', function () {
            if (nameError.textContent) {
                validateName();
            }
        });
    }

    if (messageInput) {
        messageInput.addEventListener('blur', function () {
            validateMessage();
        });

        messageInput.addEventListener('input', function () {
            if (messageError.textContent) {
                validateMessage();
            }
        });
    }

    // フォーム送信時のバリデーション
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const emailValid = validateEmail();
            const nameValid = validateName();
            const messageValid = validateMessage();
            const recaptchaValid = validateRecaptcha();

            if (emailValid && nameValid && messageValid && recaptchaValid) {
                // バリデーション成功時は Netlify にフォームを送信する
                // （以前はローカルで成功メッセージだけを表示して実際の POST を阻害していたため、メール送信が行われなかった）
                try {
                    form.submit();
                } catch (err) {
                    // 万が一 programmatic submit に失敗した場合はローカルの成功メッセージを表示
                    console.warn('form.submit() failed, showing local success message instead:', err);
                    showSuccessMessage();
                }
            } else {
                // エラーがある場合は最初のエラーフィールドにフォーカス
                const firstErrorField = form.querySelector('.error:not(:empty)')?.previousElementSibling;
                if (firstErrorField) {
                    firstErrorField.focus();
                }
            }
        });
    }

    // メールアドレスのバリデーション（ダミーメール対応）
    function validateEmail() {
        const email = emailInput.value.trim();
        // test@test なども許可する緩いバリデーション
        const emailRegex = /^[^\s@]+@[^\s@]+$/;

        // 空の場合
        if (!email) {
            showError(emailError, 'メールアドレスを入力してください。');
            return false;
        }

        // 形式チェック
        if (!emailRegex.test(email)) {
            showError(emailError, 'メールアドレスの形式が正しくありません。');
            return false;
        }

        // 長さチェック
        if (email.length > 254) {
            showError(emailError, 'メールアドレスが長すぎます。');
            return false;
        }

        hideError(emailError);
        return true;
    }

    // お名前のバリデーション
    function validateName() {
        const name = nameInput.value.trim();

        // 空の場合
        if (!name) {
            showError(nameError, 'お名前を入力してください。');
            return false;
        }

        // 長さチェック（最小）
        if (name.length < 2) {
            showError(nameError, 'お名前は2文字以上入力してください。');
            return false;
        }

        // 長さチェック（最大）
        if (name.length > 50) {
            showError(nameError, 'お名前は50文字以内で入力してください。');
            return false;
        }

        // 文字種チェック（日本語、ひらがな、カタカナ、英字、数字、スペース、一般的な記号を許可）
        const nameRegex = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBFa-zA-Z0-9\s\-・]+$/;
        if (!nameRegex.test(name)) {
            showError(nameError, 'お名前に使用できない文字が含まれています。');
            return false;
        }

        hideError(nameError);
        return true;
    }

    // メッセージのバリデーション
    function validateMessage() {
        const message = messageInput.value.trim();

        // 空の場合
        if (!message) {
            showError(messageError, '本文を入力してください。');
            return false;
        }

        // 長さチェック（最小）
        if (message.length < 10) {
            showError(messageError, '本文は10文字以上入力してください。');
            return false;
        }

        // 長さチェック（最大）
        if (message.length > 2000) {
            showError(messageError, '本文は2000文字以内で入力してください。');
            return false;
        }

        hideError(messageError);
        return true;
    }

    // reCAPTCHAのバリデーション
    function validateRecaptcha() {
        // reCAPTCHA スクリプトが未ロードの場合（ローカル開発など）はブロックしない
        if (typeof grecaptcha === 'undefined' || !grecaptcha) {
            return true;
        }

        try {
            const recaptchaResponse = grecaptcha.getResponse();

            if (!recaptchaResponse) {
                showError(recaptchaError, '認証を完了してください。');
                return false;
            }

            hideError(recaptchaError);
            return true;
        } catch (err) {
            // まれに reCAPTCHA クライアントが存在しない場合に例外が飛ぶことがあるため保護する
            console.warn('reCAPTCHA validation skipped due to error:', err);
            return true;
        }
    }

    // エラー表示
    function showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // 対応する入力フィールドのスタイル変更
        const inputField = errorElement.previousElementSibling;
        if (inputField) {
            inputField.style.borderColor = '#e74c3c';
        }
    }

    // エラー非表示
    function hideError(errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';

        // 対応する入力フィールドのスタイルリセット
        const inputField = errorElement.previousElementSibling;
        if (inputField) {
            inputField.style.borderColor = '#ddd';
        }
    }

    // 成功メッセージの表示
    function showSuccessMessage() {
        // 既存のメッセージを削除
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 成功メッセージを作成
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div style="
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
                padding: 1rem;
                border-radius: 10px;
                margin: 1rem 0;
                text-align: center;
                animation: fadeIn 0.3s ease-in;
            ">
                <h4 style="margin: 0 0 0.5rem 0;">お問い合わせを受け付けました</h4>
                <p style="margin: 0;">
                    ご連絡いただきありがとうございます。<br>
                    24時間以内にご返信いたします。
                </p>
            </div>
        `;

        // フォームの前に挿入
        form.parentNode.insertBefore(successMessage, form);

        // フォームをリセット
        form.reset();

        // エラーメッセージをクリア
        hideError(emailError);
        hideError(nameError);
        hideError(messageError);
        hideError(recaptchaError);

        // reCAPTCHAをリセット
        if (typeof grecaptcha !== 'undefined' && grecaptcha && typeof grecaptcha.reset === 'function') {
            try {
                grecaptcha.reset();
            } catch (err) {
                console.warn('grecaptcha.reset() failed:', err);
            }
        }

        // 成功メッセージにスクロール
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 5秒後にメッセージを非表示
        setTimeout(() => {
            if (successMessage) {
                successMessage.style.opacity = '0';
                successMessage.style.transition = 'opacity 0.5s ease-out';
                setTimeout(() => {
                    if (successMessage.parentNode) {
                        successMessage.parentNode.removeChild(successMessage);
                    }
                }, 500);
            }
        }, 5000);
    }
}

// アクティブなナビゲーションのハイライト
function highlightActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage ||
            (currentPage === '' && href === 'index.html') ||
            (currentPage === 'index.html' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// スムーススクロールの追加（アンカーリンク用）
document.addEventListener('click', function (e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href') &&
        e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();

        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// ページ読み込み時のフェードイン効果
window.addEventListener('load', function () {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease-in';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 50);
});

// CSS Animation の追加
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .success-message {
        animation: fadeIn 0.3s ease-in;
    }
`;
document.head.appendChild(style);