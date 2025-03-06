import { Card, Flex } from "@radix-ui/themes";
import { Loader2 } from "lucide-react";

// Loading card component
const LoadingCard = () => (
  <Card size="2">
    <Flex align="center" justify="center" className="min-h-[200px]">
      <Loader2 className="animate-spin" />
    </Flex>
  </Card>
);

export default LoadingCard;
