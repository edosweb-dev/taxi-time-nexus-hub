import { Card } from "@/components/ui/card";
import { PasseggeroForm } from "../passeggeri/PasseggeroForm";
import { useAuth } from "@/contexts/AuthContext";

export const Step4Passeggeri = () => {
  const { profile } = useAuth();

  return (
    <Card className="p-6 md:p-8">
      <PasseggeroForm userRole={profile?.role} />
    </Card>
  );
};
