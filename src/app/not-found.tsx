import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="py-16">
      <div className="text-center max-w-md mx-auto">
        <EmptyState
          icon={<FileQuestion className="w-6 h-6 stroke-[1.5]" />}
          title="Page not found"
          description="The requested editorial asset, client workspace or page does not exist."
        />
        <div className="mt-4">
          <Link href="/">
            <Button variant="secondary" size="sm">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
