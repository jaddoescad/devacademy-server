import { InputType, Field } from "type-graphql";
@InputType()
export class RegisterInput {
  @Field()
  email: string;
  @Field()
  password: string;
  @Field()
  firstName: string;
  @Field()
  lastName: string;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;
  @Field()
  password: string;
}