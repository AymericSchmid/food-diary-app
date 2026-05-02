import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDownIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

type Props = {
    mealName: string
    setMealName: (name: string) => void
    date: Date | undefined,
    openCalendar: boolean,
    setOpenCalendar: (open: boolean) => void,
    onSelectDate: (date: Date) => void,
    onSelectTime: (time: string) => void,
}

export default function MealDetailsCard({
    mealName,
    setMealName,
    date,
    openCalendar,
    setOpenCalendar,
    onSelectDate,
    onSelectTime,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Meal details</CardTitle>
            </CardHeader>
        
            <CardContent className="space-y-3" >
                <div className="space-y-2">
                    <Label htmlFor="meal-name">Meal name </Label>
                    <Input id="meal-name" placeholder="e.g. Breakfast, Lunch, Dinner, Snack..." 
                        value={mealName} onChange={(e) => setMealName(e.target.value)} />
                </div>
        
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2 col-span-2">
                        <Label>Date and time</Label>
                        <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left">
                                    {date ? format(date, "PPP") : "Select date"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <Calendar mode="single" selected={date} captionLayout="dropdown" defaultMonth={date}
                                    onSelect={onSelectDate} required
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
        
                    <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Input 
                            type="time" 
                            id="time" 
                            step="60" 
                            value={date ? format(date, "HH:mm") : ""} 
                            onChange={(e) => onSelectTime(e.target.value)}
                            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}