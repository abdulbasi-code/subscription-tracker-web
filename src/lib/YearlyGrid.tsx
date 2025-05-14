"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import { Edit, Trash2, DollarSign, Info } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  nextPayment: string;
  color: string;
  description?: string;
}

interface YearlyGridProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const monthAbbreviations = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function YearlyGrid({
  subscriptions,
  onEdit,
  onDelete,
}: YearlyGridProps) {
  const rows = 4;
  const subCache = useRef<Record<string, string>>({});
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  const doubleClickInProgress = useRef(false);

  const currentMonth = new Date().getMonth();
  const currentDate = new Date().getDate();

  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: 12 }, () => [] as Subscription[])
  );

  const monthlyBuckets: Record<number, Subscription[]> = {};
  subscriptions.forEach((sub) => {
    const date = new Date(sub.nextPayment);
    const month = date.getMonth();
    if (!monthlyBuckets[month]) monthlyBuckets[month] = [];
    monthlyBuckets[month].push(sub);
  });

  Object.entries(monthlyBuckets).forEach(([monthStr, subs]) => {
    const month = parseInt(monthStr);
    subs
      .sort(
        (a, b) =>
          new Date(a.nextPayment).getDate() - new Date(b.nextPayment).getDate()
      )
      .forEach((sub, rowIndex) => {
        if (rowIndex < rows) grid[rowIndex][month].push(sub);
      });
  });

  const monthlyCosts = Array(12).fill(0);
  subscriptions.forEach((sub) => {
    const month = new Date(sub.nextPayment).getMonth();
    monthlyCosts[month] += sub.price;
  });

  const getTextColor = (bgColor: string) => {
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "text-gray-900" : "text-white";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCardClick = (sub: Subscription) => {
    if (!doubleClickInProgress.current) {
      setOpenPopoverId(sub.id);
    }
  };

  const handleCardDoubleClick = (sub: Subscription) => {
    doubleClickInProgress.current = true;
    setOpenPopoverId(null);
    setOpenDialogId(sub.id);

    setTimeout(() => {
      doubleClickInProgress.current = false;
    }, 300);
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Track your upcoming subscription payments throughout the year
      </p>

      <ScrollArea className="w-full h-full">
        <div className="w-[1440px] rounded-lg border border-black/20 shadow-sm">
          {/* Monthly totals row */}
          <div className="grid grid-cols-[120px_repeat(12,110px)] bg-muted/30 border-black/20 text-sm border-b">
            <div className="p-3 font-medium">Monthly Total</div>
            {monthlyCosts.map((cost, idx) => (
              <div
                key={`total-${idx}`}
                className={cn(
                  "p-3 font-medium text-right",
                  idx === currentMonth && "bg-primary/10"
                )}
              >
                {cost > 0 ? `$${cost.toFixed(2)}` : "-"}
              </div>
            ))}
          </div>

          {/* Header row */}
          <div className="grid border-b border-black/20 grid-cols-[120px_repeat(12,110px)] bg-muted/50 text-sm sticky top-0">
            <div className="p-3 font-semibold">{new Date().getFullYear()}</div>
            {monthNames.map((month, idx) => (
              <div
                key={month}
                className={cn(
                  "p-3 font-semibold",
                  idx === currentMonth && "bg-primary/20"
                )}
              >
                <span className="hidden md:inline">{month}</span>
                <span className="md:hidden">{monthAbbreviations[idx]}</span>
              </div>
            ))}
          </div>

          {grid.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-[120px_repeat(12,110px)] border-b border-black/20 last:border-b-0"
            >
              <div className="p-3 bg-muted/20 border-black/20 font-medium border-r">
                Queue {rowIndex + 1}
              </div>

              {row.map((cell, colIndex) => {
                const cellId = `${rowIndex}-${colIndex}`;
                const isCurrentMonth = colIndex === currentMonth;

                return (
                  <div
                    key={cellId}
                    className={cn(
                      "h-[110px] w-[110px] border-black/20 border-r last:border-r-0 transition-colors",
                      isCurrentMonth && "bg-primary/5",
                      hoveredCell === cellId && "bg-muted/20"
                    )}
                    onMouseEnter={() => setHoveredCell(cellId)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {cell.length === 0 ? (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                        {isCurrentMonth ? "No subscriptions" : ""}
                      </div>
                    ) : (
                      cell.map((sub) => {
                        const cacheKey = sub.id;
                        const version = JSON.stringify([
                          sub.name,
                          sub.price,
                          sub.billingCycle,
                          sub.nextPayment,
                          sub.color,
                        ]);

                        const wasUpdated =
                          subCache.current[cacheKey] &&
                          subCache.current[cacheKey] !== version;

                        subCache.current[cacheKey] = version;

                        const paymentDate = new Date(sub.nextPayment).getDate();
                        const isToday =
                          isCurrentMonth && paymentDate === currentDate;
                        const textColorClass = getTextColor(sub.color);

                        return (
                          <Dialog
                            key={sub.id}
                            open={openDialogId === sub.id}
                            onOpenChange={(open) =>
                              setOpenDialogId(open ? sub.id : null)
                            }
                          >
                            <Popover
                              open={openPopoverId === sub.id}
                              onOpenChange={(open) => {
                                if (!doubleClickInProgress.current) {
                                  setOpenPopoverId(open ? sub.id : null);
                                }
                              }}
                            >
                              <PopoverTrigger asChild>
                                <motion.div
                                  className="h-[110px] w-[110px] cursor-pointer"
                                  initial={wasUpdated ? { scale: 0.95 } : false}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.3 }}
                                  onClick={() => handleCardClick(sub)}
                                  onDoubleClick={() =>
                                    handleCardDoubleClick(sub)
                                  }
                                >
                                  <Card
                                    className={cn(
                                      "h-full w-full overflow-hidden rounded-none border-none transition-all p-0 m-0 hover:shadow-md",
                                      isToday && "ring-2 ring-primary"
                                    )}
                                    style={{ backgroundColor: sub.color }}
                                  >
                                    {wasUpdated && (
                                      <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute top-1 right-1"
                                      >
                                        <Badge className="bg-white text-black text-[10px] px-1">
                                          Updated
                                        </Badge>
                                      </motion.div>
                                    )}
                                    <CardContent
                                      className={cn(
                                        "h-full w-full p-3 flex flex-col justify-between",
                                        textColorClass
                                      )}
                                    >
                                      <div>
                                        <div
                                          className="font-semibold text-sm mb-1 overflow-hidden text-ellipsis whitespace-nowrap"
                                          title={sub.name}
                                        >
                                          {sub.name}
                                        </div>

                                        <div className="flex items-center text-xs">
                                          <DollarSign className="h-3 w-3 flex-shrink-0 mr-0.5" />
                                          <span className="truncate">
                                            ${sub.price}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex justify-end mt-auto">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className={cn(
                                            "h-5 w-5 opacity-70 border-none hover:opacity-100",
                                            textColorClass
                                          )}
                                        >
                                          <Info className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              </PopoverTrigger>

                              <PopoverContent className="w-64 p-3" side="right">
                                <div className="space-y-2">
                                  <div className="font-semibold">
                                    {sub.name}
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 text-sm">
                                    <div className="text-muted-foreground">
                                      Price:
                                    </div>
                                    <div>${sub.price}</div>

                                    <div className="text-muted-foreground">
                                      Billing:
                                    </div>
                                    <div>{sub.billingCycle}</div>

                                    <div className="text-muted-foreground">
                                      Next payment:
                                    </div>
                                    <div>{formatDate(sub.nextPayment)}</div>
                                  </div>

                                  {sub.description && (
                                    <div className="pt-2 border-t mt-2">
                                      <div className="text-xs text-muted-foreground mb-1">
                                        Description:
                                      </div>
                                      <div className="text-sm">
                                        {sub.description}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>

                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Subscription Details</DialogTitle>
                              </DialogHeader>

                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <div className="text-right font-medium">
                                    Name:
                                  </div>
                                  <div className="col-span-3">{sub.name}</div>

                                  <div className="text-right font-medium">
                                    Price:
                                  </div>
                                  <div className="col-span-3">
                                    ${sub.price}/{sub.billingCycle}
                                  </div>

                                  <div className="text-right font-medium">
                                    Next payment:
                                  </div>
                                  <div className="col-span-3">
                                    {formatDate(sub.nextPayment)}
                                  </div>
                                </div>

                                <div className="flex justify-between pt-4 border-t border-black/20  mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setOpenDialogId(null);
                                      onEdit(sub);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>

                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setOpenDialogId(null);
                                      onDelete(sub.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="text-sm text-muted-foreground">
        <p>
          Showing {subscriptions.length} subscription
          {subscriptions.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
