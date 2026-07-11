import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface Props {
  title: string;
  description?: string;
}

const CatalogPlaceholder = ({ title, description }: Props) => (
  <div className="p-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Construction className="w-5 h-5 text-amber-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {description ?? "Questa sezione del Catalogo Generale sarà completata nella prossima fase. Le tabelle di database e i permessi sono già pronti."}
      </CardContent>
    </Card>
  </div>
);

export default CatalogPlaceholder;
