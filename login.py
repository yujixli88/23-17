def login(username, password):
    user = input("Введите свою почту: ")
    pwd = input("Введите свой пароль: ")
    if user == username and pwd == password:
        print("Вы успешно вошли в систему!")
    else:
        print("Неверный логин или пароль. Попробуйте снова.")
