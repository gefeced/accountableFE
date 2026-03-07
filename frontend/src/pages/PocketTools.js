import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

export default function PocketTools() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isPlayful = theme === 'playful';
  const [activeTool, setActiveTool] = useState('calendar');

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className={isPlayful ? 'rounded-full' : 'rounded-md'}
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">🛠️ Pocket Tools</h1>
          <div className="w-10"></div>
        </div>

        <div className={`bg-card p-6 border ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'}`}>
          <Tabs value={activeTool} onValueChange={setActiveTool} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calendar">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="calculator">
                📊 Calculator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
              <CalendarTool isPlayful={isPlayful} />
            </TabsContent>

            <TabsContent value="calculator">
              <CalculatorTool isPlayful={isPlayful} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Calendar Tool
function CalendarTool({ isPlayful }) {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('accountable-events');
    return saved ? JSON.parse(saved) : [];
  });
  const [newEvent, setNewEvent] = useState('');

  const addEvent = () => {
    if (!newEvent.trim()) return;

    const event = {
      id: Date.now(),
      date: date.toISOString().split('T')[0],
      title: newEvent
    };

    const updated = [...events, event];
    setEvents(updated);
    localStorage.setItem('accountable-events', JSON.stringify(updated));
    setNewEvent('');
  };

  const deleteEvent = (id) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    localStorage.setItem('accountable-events', JSON.stringify(updated));
  };

  const selectedDateEvents = events.filter(
    e => e.date === date.toISOString().split('T')[0]
  );

  return (
    <div className="py-6 space-y-6">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>

      <div>
        <h3 className="font-bold mb-3">
          Events for {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </h3>

        <div className="flex gap-2 mb-4">
          <Input
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            placeholder="Add a plan or schedule..."
            onKeyPress={(e) => e.key === 'Enter' && addEvent()}
            data-testid="event-input"
          />
          <Button
            onClick={addEvent}
            className={isPlayful ? 'rounded-full' : 'rounded-md'}
            data-testid="add-event-button"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {selectedDateEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No events for this day. Add one above!
            </p>
          ) : (
            selectedDateEvents.map(event => (
              <div
                key={event.id}
                className={`flex items-center justify-between p-3 border ${isPlayful ? 'rounded-2xl' : 'rounded-lg'}`}
                data-testid={`event-${event.id}`}
              >
                <span>{event.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteEvent(event.id)}
                  data-testid={`delete-event-${event.id}`}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Calculator Tool
function CalculatorTool({ isPlayful }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (num) => {
    setDisplay(display === '0' ? num : display + num);
  };

  const handleOperator = (op) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const result = eval(equation + display);
      setDisplay(String(result));
      setEquation('');
    } catch (error) {
      setDisplay('Error');
      setEquation('');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const buttonClass = `h-16 text-lg font-semibold border ${isPlayful ? 'rounded-2xl' : 'rounded-lg'} hover:bg-secondary transition-colors`;

  return (
    <div className="py-6">
      <div className="max-w-sm mx-auto">
        <div className={`mb-4 p-4 border ${isPlayful ? 'rounded-2xl' : 'rounded-lg'} bg-secondary`}>
          {equation && <p className="text-sm text-muted-foreground">{equation}</p>}
          <p className="text-3xl font-bold text-right" data-testid="calculator-display">{display}</p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button onClick={clear} className={`${buttonClass} col-span-2 text-destructive`} data-testid="calc-clear">C</button>
          <button onClick={() => handleOperator('/')} className={buttonClass} data-testid="calc-divide">÷</button>
          <button onClick={() => handleOperator('*')} className={buttonClass} data-testid="calc-multiply">×</button>

          <button onClick={() => handleNumber('7')} className={buttonClass} data-testid="calc-7">7</button>
          <button onClick={() => handleNumber('8')} className={buttonClass} data-testid="calc-8">8</button>
          <button onClick={() => handleNumber('9')} className={buttonClass} data-testid="calc-9">9</button>
          <button onClick={() => handleOperator('-')} className={buttonClass} data-testid="calc-minus">-</button>

          <button onClick={() => handleNumber('4')} className={buttonClass} data-testid="calc-4">4</button>
          <button onClick={() => handleNumber('5')} className={buttonClass} data-testid="calc-5">5</button>
          <button onClick={() => handleNumber('6')} className={buttonClass} data-testid="calc-6">6</button>
          <button onClick={() => handleNumber('+')} className={buttonClass} data-testid="calc-plus">+</button>

          <button onClick={() => handleNumber('1')} className={buttonClass} data-testid="calc-1">1</button>
          <button onClick={() => handleNumber('2')} className={buttonClass} data-testid="calc-2">2</button>
          <button onClick={() => handleNumber('3')} className={buttonClass} data-testid="calc-3">3</button>
          <button onClick={calculate} className={`${buttonClass} row-span-2 bg-primary text-primary-foreground`} data-testid="calc-equals">=</button>

          <button onClick={() => handleNumber('0')} className={`${buttonClass} col-span-2`} data-testid="calc-0">0</button>
          <button onClick={() => handleNumber('.')} className={buttonClass} data-testid="calc-dot">.</button>
        </div>
      </div>
    </div>
  );
}