"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateUser } from "@/lib/actions/user.actions";
import { USER_ROLES } from "@/lib/constants";
import { updateUserSchema } from "@/lib/validators";
import { UpdateUserFormFieldRenderProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectContent, SelectValue } from "@radix-ui/react-select";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const UpdateUserForm = ({
  user,
}: {
  user: z.infer<typeof updateUserSchema>;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: user,
  });
  console.log(user);
  const onHandleSubmit = async (values: z.infer<typeof updateUserSchema>) => {
    try {
      const res = await updateUser({
        ...values,
        id: user.id,
      });
      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
      }
      toast({
        variant: "default",
        description: res.message,
      });
      form.reset();
      router.push("/admin/users");
    } catch (error) {
      toast({
        variant: "destructive",
        description: (error as Error).message,
      });
    }

    router.push("/admin/users");
  };
  return (
    <Form {...form}>
      <form
        method="POST"
        onSubmit={form.handleSubmit(onHandleSubmit)}
        className="space-y-8"
      >
        <div className="w-full space-y-8">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }: UpdateUserFormFieldRenderProps<"email">) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input disabled={true} placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }: UpdateUserFormFieldRenderProps<"name">) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }: UpdateUserFormFieldRenderProps<"role">) => (
              <FormItem className="w-full">
                <FormLabel>Role</FormLabel>

                {/* <Input placeholder="Enter product name" {...field} /> */}
                <Select
                  {...field}
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Submit */}
        <div className="flex-between mt-4">
          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UpdateUserForm;
