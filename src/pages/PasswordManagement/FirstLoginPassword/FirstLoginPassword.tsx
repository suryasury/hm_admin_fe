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
import useErrorHandler from "@/hooks/useError";
import { changePassword } from "@/https/auth-service";
import { APP_ROUTES } from "@/router/appRoutes";
import { UserState } from "@/types";
import { encryptPassword } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const newPasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

interface IResetPasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const FirstLoginPassword: React.FC = () => {
  const { token } = useParams();
  const form = useForm<IResetPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const user = useSelector((state: { user: UserState }) => state.user.user);
  const handleError = useErrorHandler();
  const navigate = useNavigate();
  // const dispatch = useDispatch();

  if (user) {
    return <Navigate to={APP_ROUTES.DASHBOARD} />;
  }

  const onSubmit: SubmitHandler<IResetPasswordForm> = async (
    data: IResetPasswordForm
  ) => {
    try {
      setSubmitting(true);

      const payload: Record<string, string> = {
        oldPassword: await encryptPassword(data.currentPassword),
        newPassword: await encryptPassword(data.newPassword),
      };
      const response = await changePassword(payload, token!);
      if (response.status === 200) {
        toast.success("Password has been reset successfully.");

        // TODO : debug this re route issue
        // const detailsRes = await getProfileDetails();
        // const details = detailsRes.data.data;
        // const transformedDetails = replaceNullWithEmptyString(details);
        // dispatch(setUser(transformedDetails as User));
        // const role = transformedDetails?.role ?? "ADMIN";
        // navigate(roleToHomeRoute[role]);

        setSubmitted(true); // Set submission status to true
      }
    } catch (error) {
      if ((error as AxiosError).response?.status === 403) {
        return toast.error("Invalid request");
      }
      handleError(error, "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex justify-center items-center">
      {submitted ? (
        <Card className="w-full max-w-md">
          <CardContent className="text-center mt-8">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Your password has been reset successfully.
            </p>
            <p className="text-sm text-gray-500">
              You can now log in with your new password.
            </p>
            <Button className="mt-4" onClick={() => navigate(APP_ROUTES.LOGIN)}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Set New Password</CardTitle>
            <CardDescription>
              Enter your new password and confirm it below.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2"
              autoComplete="off"
            >
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password from the email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="************"
                            autoComplete="current-password"
                            {...field}
                          />
                          {showPassword ? (
                            <Eye
                              className="absolute cursor-pointer top-2 right-2 hover:text-muted-foreground"
                              onClick={() => setShowPassword((prev) => !prev)}
                            />
                          ) : (
                            <EyeOff
                              className="absolute cursor-pointer top-2 right-2 hover:text-muted-foreground"
                              onClick={() => setShowPassword((prev) => !prev)}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="************"
                            autoComplete="new-password"
                            {...field}
                          />
                          {showPassword ? (
                            <Eye
                              className="absolute cursor-pointer top-2 right-2 hover:text-muted-foreground"
                              onClick={() => setShowPassword((prev) => !prev)}
                            />
                          ) : (
                            <EyeOff
                              className="absolute cursor-pointer top-2 right-2 hover:text-muted-foreground"
                              onClick={() => setShowPassword((prev) => !prev)}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="************"
                            autoComplete="off"
                            {...field}
                          />
                          {showPassword ? (
                            <Eye
                              className="absolute cursor-pointer top-2 right-2 hover:text-muted-foreground"
                              onClick={() => setShowPassword((prev) => !prev)}
                            />
                          ) : (
                            <EyeOff
                              className="absolute cursor-pointer top-2 right-2 hover:text-muted-foreground"
                              onClick={() => setShowPassword((prev) => !prev)}
                            />
                          )}
                        </div>
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
                    "Reset Password"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}
    </section>
  );
};

export default FirstLoginPassword;
