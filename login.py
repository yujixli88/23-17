def login(username, password):
    user = input("Введите свою почту: ")
    pwd = input("Введите свой пароль: ")
    if user == username and pwd == password:
        print("Вы успешно вошли в систему!")
    elif user != username and pwd == password:
        print("Неверный логин. Попробуйте снова.")
    elif user == username and pwd != password:
        print("Неверный пароль. Попробуйте снова.")
    else:
        print("Неверный логин или пароль. Попробуйте снова.")
    
