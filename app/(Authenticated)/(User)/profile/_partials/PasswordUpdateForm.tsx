/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { setFormErrors } from "@/lib/setFormErrors";
import { passwordUpdateSchema } from "@/server/zodSchema/passwordUpdateSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const PasswordUpdateForm = () => {
  const [status, setStatus] = useState<StatusType>("initial");
  const methods = useForm<z.infer<typeof passwordUpdateSchema>>({
    mode: "onTouched",
    resolver: zodResolver(passwordUpdateSchema),
  });

  const onSubmit = async (data: z.infer<typeof passwordUpdateSchema>) => {
    try {
      const res = true;
      const isError = setFormErrors(res, methods.setError);
      if (!isError) {
        setStatus("success");
        methods.reset();
        setTimeout(() => setStatus("initial"), 2000);
      }
    } catch (error: unknown) {
      setStatus("error");
    }
  };

  return (
    <Card className="h-fit w-full">
      <CardHeader>
        <CardTitle>Update Password</CardTitle>
      </CardHeader>
      <CardContent>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-6 p-6 md:p-8">
            <Input type="password" name="currentPassword" placeholder="Current Password" label="Current Password" required />
            <Input type="password" name="newPassword" placeholder="New Password" label="New Password" required />
            <Input type="password" name="confirmPassword" placeholder="Confirm New Password" label="Confirm New Password" required />
            <div className="flex items-center gap-2">
              <Button className="w-fit" loading={methods.formState.isSubmitting}>
                Update Password
              </Button>
              <AnimatePresence>
                {status === "success" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
                    <Badge className="flex h-full items-center gap-2" variant={"success"}>
                      <CircleCheck />
                      Saved
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};

export default PasswordUpdateForm;
