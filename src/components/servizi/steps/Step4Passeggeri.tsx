import { Card } from "@/components/ui/card";
import { PasseggeroForm } from "../passeggeri/PasseggeroForm";
import { useAuth } from "@/contexts/AuthContext";

export const Step4Passeggeri = () => {
  const { profile } = useAuth();

  return (
    <Card className="w-full p-4 md:p-6">
      <PasseggeroForm userRole={profile?.role} />
    </Card>
  );
};
