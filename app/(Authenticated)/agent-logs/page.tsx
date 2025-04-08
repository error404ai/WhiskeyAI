import LogList from "./_partials/LogList";

const page = async () => {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  return (
    <div>
      <LogList />
    </div>
  );
};

export default page;
