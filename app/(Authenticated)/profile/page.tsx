import DeleteAccount from "./_partials/DeleteAccount";
import PasswordUpdateForm from "./_partials/PasswordUpdateForm";
import ProfileBasicInfo from "./_partials/ProfileBasicInfo";

const page = async () => {
  return (
    <div className="flex w-full gap-6">
      <ProfileBasicInfo />
      <div className="flex w-full flex-col gap-6">
        <PasswordUpdateForm />
        <DeleteAccount />
      </div>
    </div>
  );
};

export default page;
