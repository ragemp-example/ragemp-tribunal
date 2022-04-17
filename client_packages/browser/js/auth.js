var auth = new Vue({
    el: "#auth",
    data: {
        show: false,
        loaderShow: true,
        loginOrEmail: "",
        password: "",
        password2: "",
        login: "",
        email: "",
        code: "",
        prompt: "",
        form: 0,
        focus: "", // input в фокусе
        error: "", // input с ошибкой
        promptShowTime: 10000,
        loginMessages: ["Заполните поле логина или почты!",
            "Некорректное значение логина или почты!",
            "Неверный пароль!",
            "todo",
            "Неверный логин или пароль!",
            "Неверный Social Club!",
            "Аккаунт уже авторизован!",
            "Вход в аккаунт выполнен успешно",
            "Аккаунт заблокирован",
        ],
        registerMessages: ["Вы уже зарегистрировали учетную запись!",
            "Логин должен состоять из 5-20 символов!",
            "Пароль должен состоять из 6-20 символов!",
            "Email должен быть менее 40 символов!",
            "Некорректный логин!",
            "Некорректный email!",
            "Логин занят!",
            "Email занят!",
            "Аккаунт с вашим Social Club уже зарегистрирован!",
            "Аккаунт зарегистрирован успешно"
        ],
        emailConfirmMessages: ["Код подтверждения неверный!",
            "Подтверждение почты прошло успешно",
            "На данный момент подтвердить почту невозможно"
        ],
        recoveryMessages: ["Заполните поле логина или почты!",
            "Некорректное значение логина или почты!",
            "Аккаунт не найден",
            null,
            "Неверный код подтверждения",
            null,
            "Пароль должен состоять из 6-20 символов!",
            "Подтвердите код",
            "Аккаунт восстановлен",
            null,
        ],
        recoveryCodeSent: false,
        recoveryCodeConfirmed: false,
        recoveryCompleted: false,
        // sound: null,
        loader: false,
    },
    methods: {
        switchForm(form_id) {
            if (this.loader)
                return;

            this.form = form_id;
        },
        authAccountHandler() {
            if (this.loader == true) return;

            this.prompt = "";
            if (!this.loginOrEmail) {
                this.prompt = "Введите логин или email";
                this.error = "auth-login"
                return;
            }
            var regLogin = /^[0-9a-z_\.-]{5,20}$/i;
            var regEmail = /^[0-9a-z-_\.]+\@[0-9a-z-_]{1,}\.[a-z]{1,}$/i;
            if (!regLogin.test(this.loginOrEmail) && !regEmail.test(this.loginOrEmail)) {
                this.prompt = "Некорректное значение";
                this.error = "auth-login"
                return;
            }

            if (this.password.length < 6 || this.password.length > 20) {
                this.prompt = "Пароль должен содержать от 6 до 20 символов";
                this.error = "auth-pass"
                return;
            }

            this.loader = true;
            mp.trigger("auth.login", JSON.stringify({
                loginOrEmail: this.loginOrEmail.toLowerCase(),
                password: this.password
            }));
        },
        regAccountHandler(emailCode) {
            if (this.loader == true) return;

            if (!this.login) {
                this.prompt = "Введите логин";
                this.error = "reg-login";
                return;
            }
            if (!this.email) {
                this.prompt = "Введите Email";
                this.error = "reg-email";
                return;
            }
            if (!this.password.length) {
                this.prompt = "Введите пароль";
                this.error = "reg-pass";
                return;
            }

            if (!this.password2.length) {
                this.prompt = "Повторите пароль";
                this.error = "reg-pass2";
                return;
            }

            if (this.login.length < 5 || this.login.length > 20) {
                this.prompt = "Логин должен содержать от 5 до 20 символов";
                this.error = "reg-login";
                return;
            }
            if (this.email.length > 40) {
                this.prompt = "Email должен быть менее 40 символов";
                this.error = "reg-email";
                return;
            }
            var r = /^[0-9a-z_\.-]{5,20}$/i;
            if (!r.test(this.login)) {
                this.prompt = "Разрешенные символы: буквы латинского алфавита, цифры, дефис или знак подчеркивания";
                this.error = "reg-login";
                return;
            }

            if (this.password.length < 6 || this.password.length > 20) {
                this.prompt = "Пароль должен содержать от 6 до 20 символов";
                this.error = "reg-pass";
                return;
            }

            var r = /^[0-9a-z-_\.]+\@[0-9a-z-_]{1,}\.[a-z]{1,}$/i;
            if (!r.test(this.email)) {
                this.prompt = "Некорректный email";
                this.error = "reg-email";
                return;
            }
            if (this.password2 != this.password) {
                this.prompt = "Пароли не совпадают";
                this.error = "reg-pass2";
                return;
            }

            this.loader = true;
            mp.trigger("auth.register", JSON.stringify({
                login: this.login.toLowerCase(),
                email: this.email,
                password: this.password,
                emailCode: emailCode
            }));
        },
        recoveryAccountHandler() {
            if (this.recoveryCodeSent) {
                if (!this.code) {
                    this.prompt = "Введите код";
                    this.error = "conf-code";
                    return;
                }

                this.loader = true;
                mp.trigger(`callRemote`, `auth.recovery.confirm`, this.code);
                this.code = '';
                return;
            }
            if (this.recoveryCodeConfirmed) {
                if (!this.password.length) {
                    this.prompt = "Введите пароль";
                    this.error = "conf-pass";
                    return;
                }

                if (!this.password2.length) {
                    this.prompt = "Повторите пароль";
                    this.error = "conf-pass2";
                    return;
                }
                if (this.password.length < 6 || this.password.length > 20) {
                    this.prompt = "Пароль должен содержать от 6 до 20 символов";
                    this.error = "conf-pass";
                    return;
                }
                if (this.password2 != this.password) {
                    this.prompt = "Пароли не совпадают";
                    this.error = "conf-pass2";
                    return;
                }

                this.loader = true;
                mp.trigger(`callRemote`, `auth.recovery.password`, this.password);
                return;
            }

            if (!this.loginOrEmail) {
                this.prompt = "Введите логин или Email";
                this.error = "conf-login"
                return;
            }
            var regLogin = /^[0-9a-z_\.-]{5,20}$/i;
            var regEmail = /^[0-9a-z-_\.]+\@[0-9a-z-_]{1,}\.[a-z]{1,}$/i;
            if (!regLogin.test(this.loginOrEmail) && !regEmail.test(this.loginOrEmail)) {
                this.prompt = "Некорректное значение";
                this.error = "conf-login"
                return;
            }

            this.loader = true;
            mp.trigger("callRemote", `auth.recovery`, this.loginOrEmail);
        },
        confirmEmailHandler(confirm) {
            if (this.loader)
                return;

            if (!confirm) {
                mp.trigger(`callRemote`, `auth.email.confirm`, 0);
                this.show = false;
            }
            else mp.trigger(`callRemote`, `auth.email.confirm.code`, this.code);

            this.loader = true;
        },
        showLoginResult(code) {
            if (!this.loginMessages[code]) return;
            this.prompt = this.loginMessages[code];
            if (code == 7) auth.show = false;
            this.loader = false;
        },
        showRegisterResult(code) {
            if (!this.registerMessages[code]) return;
            this.prompt = this.registerMessages[code];
            if (code == 9) {
                this.form = 3;
                mp.trigger(`callRemote`, `auth.email.confirm`, 1);
                // открывается панель, на которой нужно предложить пользователю подтвердить почту
                // там можно либо не подтверждать и вызывать mp.trigger('auth.email.confirm', answer);
                // где 0 - не согласился подтвердить
                // 1 - согласился подтвердить
                // в случае если пользователь согласился подвтердить почту,
                // то должно открыться окно ввода пароля из письма, отправленного на электронную почту
                // После чего пользователь вводит пароль из письма и ты вызываешь mp.trigger('auth.email.confirm.code', code);
                // и тебе приходит ответ `auth.showEmailConfirmResult(${result})`
            }

            this.loader = false;
        },
        showEmailConfirmResult(code) {
            if (!this.emailConfirmMessages[code]) return;
            this.prompt = this.emailConfirmMessages[code];
            if (code == 1) this.show = false;
            this.loader = false;
        },
        showRecoveryResult(code) {
            this.loader = false;
            // код был отправлен на почту
            if (code == 3) {
                this.recoveryCodeSent = true;
                return;
            }
            // код был подтвержден
            if (code == 5) {
                this.recoveryCodeSent = false;
                this.recoveryCodeConfirmed = true;
                return;
            }
            // аккаунт восстановлен
            if (code == 8) {
                this.recoveryCodeConfirmed = false;
                this.recoveryCompleted = true;
                this.form = 0;
            }
            // превышено количество попыток
            if (code == 9) {
                this.show = false;
                notifications.push('error', "Превышено количество попыток (вы были кикнуты)");
                return;
            }

            if (!this.recoveryMessages[code]) return;
            this.prompt = this.recoveryMessages[code];
            // if (result == 1) auth.show = false;
        },
        showChangelist(i) {
            changelist.i = i;
            changelist.show = true;
        },
    },
    computed: {
        header() {
            var headers = ["Добро пожаловать!", "Регистрация аккаунта", "Восстановление аккаунта", "Подтверждение почты"];
            return headers[this.form];
        },
        title() {
            let titles = [
                "Для авторизации необходимо заполнить все поля ниже",
                "Для регистрации необходимо заполнить все поля ниже",
                "Для восстановления аккаунта укажите следующие данные",
                "Для подтверждения необходимо указать код из сообщения"
            ];
            return titles[this.form];
        },
        updates() {
//            return changelist.list.slice().reverse();
        },
    },
    watch: {
        prompt(val, oldVal) {
            if (oldVal || !val) return;

            var self = this;
            setTimeout(function() {
                self.prompt = "";
            }, self.promptShowTime);
        },
        show(val) {
            if (val) busy.add("auth", true, true);
            else {
                busy.remove("auth", true);
                this.sound.fade(1, 0, 2000);
            }
        },
    },
    mounted() {
        // this.sound = new Howl({
        //     src: ['audio/auth.mp3'],
        //     loop: true,
        // });
        // this.sound.play();
    },
});

// for tests
// auth.show = true;
