import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { roleToHomeRoute } from "@/config/RolesToHome";
import useErrorHandler from "@/hooks/useError";
import { getProfileDetails, login } from "@/https/auth-service";
import { APP_ROUTES } from "@/router/appRoutes";
import { setUser } from "@/state/userReducer";
import { IloginForm, User, UserState } from "@/types";
import { replaceNullWithEmptyString } from "@/utils";
import { AxiosError } from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  userName: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginForm = () => {
  const form = useForm<IloginForm>({
    resolver: zodResolver(loginSchema),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const user = useSelector((state: { user: UserState }) => state.user.user);
  const handleError = useErrorHandler();

  if (user && user.role) {
    return <Navigate to={roleToHomeRoute[user.role]} />;
  }

  const onSubmit: SubmitHandler<IloginForm> = async (data: IloginForm) => {
    try {
      setSubmitting(true);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const userNameType = emailRegex.test(data.userName)
        ? "EMAIL"
        : "PHONE_NUMBER";

      const payload = {
        ...data,
        userNameType,
      };
      const response = await login(payload);
      if (response.status === 200) {
        const isFirstLogin = response.data.data.needPasswordChange;
        if (isFirstLogin) {
          return navigate(
            APP_ROUTES.FIRST_TIME_PASSWORD +
              `/${response.data.data.accessToken}`
          );
        }
        const detailsRes = await getProfileDetails();
        const details = detailsRes.data.data;
        const transformedDetails = replaceNullWithEmptyString(details);
        dispatch(setUser(transformedDetails as User));
        const role = transformedDetails?.role ?? "ADMIN";

        navigate(roleToHomeRoute[role]);
      }
      toast.success("Logged in successfully");
    } catch (error) {
      if ((error as AxiosError).response?.status === 403) {
        return toast.error("Invalid credentials");
      }
      handleError(error, "Failed to login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex justify-center items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>Log in to your account</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="************"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner type="light" />
                    Please wait...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
              <div className="mt-4 self-start flex gap-2 items-center justifu-center text-sm">
                <Link
                  to={APP_ROUTES.FORGET_PASSWORD}
                  className="underline m-0 p-0"
                >
                  Forgot Password?
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </section>
  );
};

export default LoginForm;
