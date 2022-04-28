import { RegisterInput } from "../resolvers/AuthInput";

export const validateRegister = (options: RegisterInput) => {
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "invalid email",
      },
    ];
  }

  if (options.firstName === "" || options.firstName === undefined || options.firstName === null) {
    return [
      {
        field: "firstName",
        message: "Please provide a first name",
      },
    ];
  }

  if (options.firstName === "" || options.firstName === undefined || options.firstName === null) {
    return [
      {
        field: "lastName",
        message: "Please provide a last name",
      },
    ];
  }

  if (options.email.length <= 2) {
    return [
      {
        field: "username",
        message: "length must be greater than 2",
      },
    ];
  }

  if (options.password.length <= 2) {
    return [
      {
        field: "password",
        message: "length must be greater than 2",
      },
    ];
  }

  return null;
};