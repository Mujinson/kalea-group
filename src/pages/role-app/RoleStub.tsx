interface Props { title: string; }
const RoleStub = ({ title }: Props) => (
  <div className="p-4">
    <h1 className="text-[22px] font-semibold text-[#1E1B4B] mb-2">{title}</h1>
    <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 text-[#6B6258] text-[15px]">
      Sezione in costruzione. Verrà completata nei prossimi step.
    </div>
  </div>
);
export default RoleStub;
