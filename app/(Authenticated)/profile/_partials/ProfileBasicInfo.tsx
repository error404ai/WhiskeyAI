/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DatePicker from "@/components/DatePicker/DatePicker";
import ImageInput from "@/components/MyUi/ImageInput/ImageInput";
import SelectInput from "@/components/MyUi/SelectInput/SelectInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { profileBasicInfoSchema } from "@/db/zodSchema/profileUpdateSchema";
import * as ProfileController from "@/http/controllers/profileController";
import { useGetCountryQuery } from "@/redux/features/publicSlice/publicApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Skeleton from "react-loading-skeleton";
import { z } from "zod";

const ProfileBasicInfo = () => {
  const {
    isPending,
    data: user,
    refetch,
  } = useQuery({
    queryKey: ["getAuthUser"],
    queryFn: ProfileController.getAuthUser,
  });
  const { update, data: session } = useSession();
  const { data } = useGetCountryQuery({});
  const [status, setStatus] = useState<StatusType>("initial");
  const countryItem = data?.map((country: any) => ({
    label: country.name.common,
    value: country.name.common,
  }));
  const methods = useForm<z.infer<typeof profileBasicInfoSchema>>({
    mode: "onTouched",
    resolver: zodResolver(profileBasicInfoSchema),
  });
  const onSubmit = async (data: z.infer<typeof profileBasicInfoSchema>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value && typeof value !== "string" && key === "avatar") {
        formData.append(key, value);
      } else if (value && key !== "avatar") {
        formData.append(key, value);
      }
    });
    setStatus("loading");
    const res = await ProfileController.updateProfileBasicInfo(formData);
    if (res) {
      setStatus("success");
      refetch().then(async (updatedUserQuery) => {
        await update({
          user: updatedUserQuery.data,
        });
      });
      setTimeout(() => {
        setStatus("initial");
      }, 3000);
    } else {
      setStatus("error");
    }
  };

  useEffect(() => {
    methods.setValue("customer_id", user?.customer_id ?? "");
    methods.setValue("name", user?.name ?? "");
    methods.setValue("avatar", user?.avatar ?? "");
    methods.setValue("email", user?.email ?? "");
    methods.setValue("phone", user?.phone ?? "");
    methods.setValue("country", user?.country ?? "");
    methods.setValue("street_address", user?.street_address ?? "");
    methods.setValue("date_of_birth", user?.date_of_birth ?? "");
  }, [user, methods]);

  console.log("user is", user);
  console.log("jwt user", session);

  return (
    <Card className="h-fit w-full">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {!isPending && (
          <FormProvider {...methods}>
            {methods.formState.errors.customer_id?.message}
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-6 p-6 md:p-8">
              <ImageInput required label="Profile Image" name="avatar" />
              <Input required label="Name" type="text" placeholder="Enter your name" name="name" />
              <Input required label="Email" type="email" placeholder="Enter your email" name="email" />
              <Input label="Phone" type="text" placeholder="Enter your phone" name="phone" />
              <SelectInput name="country" label="Country" items={countryItem} />
              <Textarea className="h-20" label="Street Address" name="street_address" />
              <DatePicker label="Date of Birth" name="date_of_birth" />
              <div className="flex gap-3">
                <Button parentClass="w-fit" loading={status === "loading"}>
                  Submit
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
        )}
        {isPending && (
          <div className="flex flex-col gap-3">
            <Skeleton circle height={80} width={80} />
            <Skeleton count={7} height={20} containerClassName="space-y-3" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileBasicInfo;
