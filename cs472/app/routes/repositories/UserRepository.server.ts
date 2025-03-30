interface LoginRespones {
  message: string;
  error: string;
  user: User;
}

export default class UserRepository {
  
  public async login(email: string, password: string): Promise<LoginRespones> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const response = await fetch(`${BACKEND_URL}/api/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data: LoginRespones = await response.json();
    return data;
  }

  public async getUserByEmail(email: string): Promise<User> {
    //localhost3000
    const BACKEND_URL = process.env.BACKEND_URL as string;
    //api ของ function นั้นๆ
    const response = await fetch(`${BACKEND_URL}/api/user/getByEmail/${email}`);
    const data: User = await response.json();
    
    return data;
  }

  public async createUser(
    name: string,
    surname: string,
    password: string,
    email: string,
    year: number
  ): Promise<User> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const response = await fetch(`${BACKEND_URL}/api/user/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, surname, password, email, year }),
    });
    const data: User = await response.json();
    
    return data;
  }

  public async updateUser(
    uuid: string,
    name?: string,
    surname?: string,
    password?: string,
    email?: string,
    year?: number,
    role?: "student" | "teacher"
  ): Promise<User> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const response = await fetch(`${BACKEND_URL}/api/user/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uuid, name, surname, password, email, year, role }),
    });
    const data: User = await response.json();
    
    return data;
  }
}
