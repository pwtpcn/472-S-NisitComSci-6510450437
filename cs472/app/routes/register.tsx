import {
  Link,
  redirect,
  useFetcher,
  type ActionFunctionArgs,
} from "react-router";
import UserRepository from "./repositories/UserRepository.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const year = Number(formData.get("year"));
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  let errors: Record<string, any> = {};

  if (!firstName || firstName.length < 2 || firstName.length > 15)
    errors.firstName = "First name should contain 2-15 characters";

  if (!lastName || lastName.length < 2 || lastName.length > 15)
    errors.lastName = "Last name should contain 2-15 characters";

  if (!year || year < 1 || year > 8)
    errors.year = "Year must be between 1 and 8";

  if (!email) {
    errors.email = "Please input email";
  } else {
    const userRepo = new UserRepository();
    const existEmail = await userRepo.getUserByEmail(email);
    if (existEmail) {
      errors.email = "Email already used";
    }
    if (
      existEmail.error == "User not found" &&
      errors.email == "Email already used"
    ) {
      delete errors.email;
    }
  }

  if (!password) {
    errors.password = "Please input your password";
  } else {
    let validPassword:boolean = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,12}$/.test(password);
    if (!validPassword) {
      errors.password = "Password should contain 8-12 characters with\n Upper case, Lower case, numeric and special characters"
    }
    if (validPassword && errors.password) {
      delete errors.password;
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (Object.keys(errors).length > 0) {
    //log check errror
    console.log("Errors: ", errors);
    return { errors }; // Return all errors if any exist
  } else {
    const userRepo = new UserRepository();
    const response = await userRepo.createUser(
      firstName,
      lastName,
      password,
      email,
      year
    );

    console.log("Response: ", response);

    if (response) {
      return redirect("/login");
    }
  }

  return null;
}

export default function Register() {
  const fetcher = useFetcher();
  const errors = fetcher.data?.errors || {};

  return (
    <div className="bg-[#C0E0FF] h-screen flex flex-col justify-center items-center overflow-auto">
      <fetcher.Form
        method="post"
        action="/register"
        className="bg-blue-50 h-fit w-fit p-5 px-10 rounded-2xl shadow-lg flex flex-col justify-center items-center gap-4"
      >
        <h1 className="text-[#1E364C] font-extrabold text-3xl">Register</h1>

        <div> 
        <input
          name="firstName"
          type="text"
          placeholder="First Name"
          className="border border-gray-300 p-2 text-[#1E364C] bg-[#FFFFFF] w-full"
        ></input>
        {errors.firstName && (
          <h1 className="text-red-500 text-[12px]">{errors.firstName}</h1>
        )}
        </div>

        <div>
        <input
          name="lastName"
          type="text"
          placeholder="Last Name"
          className="border border-gray-300 p-2 text-[#1E364C] bg-[#FFFFFF] w-full"
        ></input>
        {errors.lastName && <h1 className="text-red-500 text-[12px]">{errors.lastName}</h1>}
        </div>

        <div>
        <input
          name="year"
          type="number"
          placeholder="year"
          className="border border-gray-300 p-2 text-[#1E364C] bg-[#FFFFFF] w-full"
        ></input>
        {errors.year && <h1 className="text-red-500 text-[12px]">{errors.year}</h1>}
        </div>

        <div>
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border border-gray-300 p-2 text-[#1E364C] bg-[#FFFFFF] w-full"
        ></input>
        {errors.email && <h1 className="text-red-500 text-[12px]">{errors.email}</h1>}
        </div>

        <div className="">
        <input
          name="password"
          type="password"
          placeholder="password"
          className="border border-gray-300 p-2 text-[#1E364C] bg-[#FFFFFF] w-full"
        ></input>
        {errors.password && <h1 className="text-red-500 text-[12px] w-3xs">{errors.password}</h1>}
        </div>

        <div>
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          className="border border-gray-300 p-2 text-[#1E364C] bg-[#FFFFFF] w-full"
        ></input>
        {errors.confirmPassword && (
          <h1 className="text-red-500 text-[12px]">{errors.confirmPassword}</h1>
        )}
        </div>
        
      
        <button
          className="bg-[#7793AE] text-white p-2 rounded-2xl w-40 hover:bg-[#43586c] transition"
          type="submit"
        >
          create account
        </button>

        <div className="flex flex-row gap-2">
          <h1 className="text-[#1E364C] text-[12px]">
            Already have an account?
          </h1>
          <Link
            to="/login"
            prefetch="render"
            className="text-[#1E364C] underline font-bold hover:font-extrabold text-[12px]"
          >
            LogIn
          </Link>
        </div>
      </fetcher.Form>
    </div>
  );
}
