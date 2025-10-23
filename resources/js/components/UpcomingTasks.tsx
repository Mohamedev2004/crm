import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";

interface Task {
  id: number;
  title: string;
  due_date: string;
  priority: "low" | "medium" | "high";
  description?: string; // added description
}

interface UpcomingTasksProps {
  tasks: Task[];
  viewAllLink: string;
}

export function UpcomingTasks({ tasks, viewAllLink }: UpcomingTasksProps) {
  const priorityColors = {
    high: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
    medium: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300",
    low: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
  };

  return (
    <Card className="flex flex-col flex-1">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-0 gap-2">
        {/* Left: Title + Description */}
        <div>
          <CardTitle>Upcoming Tasks</CardTitle>
          <CardDescription className="mt-2">Track and manage your upcoming tasks.</CardDescription>
        </div>

        {/* Right: View All button */}
        <Link href={viewAllLink}>
          <Button variant="outline">View all</Button>
        </Link>
      </CardHeader>

      <CardContent className="">
        {tasks.length === 0 ? (
          <p className="text-sm italic text-neutral-500 dark:text-neutral-400">
            No upcoming tasks.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map((task) => {
              const due = new Date(task.due_date);
              const today = new Date();
              const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));

              let dueLabel = "";
              if (diffDays <= 0) dueLabel = "Due Today";
              else if (diffDays === 1) dueLabel = "Due Tomorrow";
              else dueLabel = `Due ${due.toLocaleDateString()}`;

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
                >
                  {/* Left: Task title */}
                  <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {task.title}
                  </h4>

                  {/* Right: Priority + Due */}
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}
                    >
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                    <span>{dueLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
