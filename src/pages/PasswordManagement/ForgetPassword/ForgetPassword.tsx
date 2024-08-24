// ResetPassword.tsx
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
import { sendResetPasswordEmail } from "@/https/auth-service";
import { APP_ROUTES } from "@/router/appRoutes";
import { UserState } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

interface IResetPasswordForm {
  email: string;
}
const ForgetPassword: React.FC = () => {
  const form = useForm<IResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false); // Track submission status

  const user = useSelector((state: { user: UserState }) => state.user.user);
  const handleError = useErrorHandler();

  if (user) {
    return <Navigate to={APP_ROUTES.DASHBOARD} />;
  }

  const onSubmit: SubmitHandler<IResetPasswordForm> = async (
    data: IResetPasswordForm
  ) => {
    try {
      setSubmitting(true);

      const response = await sendResetPasswordEmail(data.email);
      if (response.status === 200) {
        toast.success("Password reset link sent successfully.");
      }
      setSubmitted(true);
      toast.success("Password reset link sent successfully.");
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
              Check your email for a password reset link.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your email to receive a password reset link.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@example.com"
                          {...field}
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
                    "Send Reset Link"
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

export default ForgetPassword;
