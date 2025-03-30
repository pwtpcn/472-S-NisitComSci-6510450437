import { Role, User } from "@prisma/client";
import db from "../database";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

class UserRepository {
  public async getUserByID(uuid: string): Promise<User | null> {
    return await db.user.findUnique({
      where: { uuid },
    });
  }

  public async getAllUsers(): Promise<User[]> {
    return await db.user.findMany();
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await db.user.findUnique({
        where: { email },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new Error(error.code);
      }
    }
    throw new Error("Internal Server Error");
  }

  public async login(
    email: string,
    password: string
  ): Promise<Partial<User | null>> {
    try {
      const loggingInUser = await this.getUserByEmail(email);

      if (!loggingInUser) {
        throw new Error("Invalid email or password");
      }

      //check if password correct
      const isValidPassword = await Bun.password.verify(
        password + loggingInUser.salt,
        loggingInUser.password
      );

      //Debugging log
      // console.log("isValidPassword: ", isValidPassword);

      if (!isValidPassword) {
        console.log("Invalid email or password");
        throw new Error("Invalid email or password");
      }

      const user = await db.user.findUnique({
        where: { email: email },
        select: {
          uuid: true,
          name: true,
          surname: true,
          email: true,
          year: true,
          role: true,
        },
      });

      // console.log(user);
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new Error(error.code);
      }
    }
    throw new Error("Internal Server Error");
  }

  

  public async createUser({
    name,
    surname,
    password,
    email,
    year,
  }: {
    name: string;
    surname: string;
    password: string;
    email: string;
    year: number;
  }): Promise<User> {
    const salt = Math.random().toString(36).substring(2, 12); //generate random salt
    const hashedPassword = await Bun.password.hash(password + salt, "bcrypt"); //hash password
    try {
      const response = await db.user.create({
        data: {
          name: name,
          surname: surname,
          password: hashedPassword,
          email: email,
          year: year,
          salt: salt,
        },
      });
      return response;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            throw new Error("Email already exists");
          default:
            throw new Error("Internal Server Error");
        }
      }
    }
    throw new Error("Internal Server Error");
  }

  public async updatedUser(
    uuid: string,
    updates: {
      name?: string;
      surname?: string;
      password?: string;
      email?: string;
      year?: number;
    }
  ): Promise<User> {
    try {
      if (updates.password) {
        const user = await this.getUserByID(uuid);
        if (user) {
          const hashedPassword = await Bun.password.hash(
            updates.password + user.salt,
            "bcrypt"
          );
          updates.password = hashedPassword;
        }
      }

      const response = await db.user.update({
        where: { uuid },
        data: updates,
      });
      return response;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          default:
            throw new Error(error.code);
        }
      }
    }
    throw new Error("Internal Server Error");
  }

  public async deleteUser(id: string): Promise<User | null> {
    try {
      const response = await db.user.delete({
        where: { uuid: id },
      });
      return response;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2025":
            throw new Error("Record does not exists.");
          default:
            throw new Error(error.code);
        }
      }
    }
    throw new Error("Internal Server Error");
  }

  public async updateUserPassword(
    userId: string,
    newPassword: string
  ): Promise<User> {
    try {
      const user = await this.getUserByID(userId);
      if (!user) throw new Error("User does not exists.");

      const hashedPassword = await Bun.password.hash(
        newPassword + user.salt,
        "bcrypt"
      );
      return await db.user.update({
        where: { uuid: userId },
        data: { password: hashedPassword },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2025":
            throw new Error("Record does not exists.");
          default:
            throw new Error(error.code);
        }
      }
    }
    throw new Error("Internal Server Error");
  }
}

export default UserRepository;
