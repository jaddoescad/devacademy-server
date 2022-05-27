import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
  FieldResolver,
  Root,
} from "type-graphql";
import { MyContext } from "../types";
import { Instructor } from "../entities/Instructor";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { RegisterInput, LoginInput } from "./AuthInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendemail";
import { v4 as uuidv4 } from "uuid";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class InstructorResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Instructor, { nullable: true })
  instructor?: Instructor;
}

@Resolver(Instructor)
export class InstructorResolver {
  @FieldResolver(() => String)
  email(@Root() user: Instructor, @Ctx() { req }: MyContext) {
    // this is the current user and its ok to show them their own email
    if (req.session.userId === user.id) {
      return user.email;
    }
    // current user wants to see someone elses email
    return "";
  }
  
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const instructor = await Instructor.findOneBy({ email });
    if (!instructor) {
      return true;
    }
    const token = uuidv4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      instructor.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    ); //good for 3 days

    sendEmail(
      instructor.email,
      `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
    );
    return true;
  }

  @Mutation(() => InstructorResponse)
  async register(
    @Arg("options") options: RegisterInput,
    @Ctx() { req }: MyContext
  ): Promise<InstructorResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);

    var instructor;

    try {
      instructor = await Instructor.create({
        email: options.email,
        firstName: options.firstName,
        lastName: options.lastName,
        password: hashedPassword,
      }).save();
    } catch (err) {
      //|| err.detail.includes("already exists")) {
      // duplicate username error
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "email",
              message: "email already taken",
            },
          ],
        };
      } else {
        return {
          errors: [
            {
              field: "email",
              message: err.message,
            },
          ],
        };
      }
    }

    req.session.userId = instructor.id;

    return { instructor };
  }

  @Query(() => Instructor, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    // you are not logged in
    console.log(req.session);
    if (!req.session.userId) {
      return null;
    }

    const user = await Instructor.findOneBy({ id: req.session.userId });
    return user;
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log("failed to log out");
          resolve(false);
          return;
        } else resolve(true);
      })
    );
  }
  @Mutation(() => InstructorResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<InstructorResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }
    const instructorId = userId;
    const instructor = await Instructor.findOneBy({ id: instructorId });

    if (!instructor) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    await Instructor.update(
      { id: instructorId },
      {
        password: await argon2.hash(newPassword),
      }
    );

    await redis.del(key);

    // log in user after change password
    req.session.userId = instructor.id;

    return { instructor };
  }

  @Mutation(() => InstructorResponse)
  async login(
    @Arg("options") options: LoginInput,
    @Ctx() { req }: MyContext
  ): Promise<InstructorResponse> {
    const instructor = await Instructor.findOneBy({ email: options.email });
    if (!instructor) {
      return {
        errors: [
          {
            field: "email",
            message: "that email doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(instructor.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = instructor.id;

    return {
      instructor,
    };
  }
}
