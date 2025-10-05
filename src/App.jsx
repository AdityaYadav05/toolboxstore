import Navbar from "./pages/Navbar"
import Main from "./pages/Main"
import Footer from "./pages/Footer"
import { useState } from "react";
import QRCodeGenerator from "./components/Creative&Design/QRCodeGenerator";
import GradientGenerator from "./components/Creative&Design/GradientGenerator";
import WordCounter from "./components/Text&Content/WordCounter";
import PasswordGenerator from "./components/Text&Content/PasswordGenerator";
import Calculator from "./components/Calculators/Calculator";
import BMICalculator from "./components/Calculators/BMICalculator";
import AgeCalculator from "./components/Calculators/AgeCalculator";
import PomodoroTimer from "./components/Productivity/PomodoroTimer";
import TodoList from "./components/Productivity/TodoList";
import PhotoEditor from "./components/Creative&Design/PhotoEditor";
import GhibliGenerator from "./components/Creative&Design/GhibliGenerator";
import ComingSoon from "./ComingSoon/ComingSoon";
import MemeGenerator from "./components/Creative&Design/MemeGenerator";
import ColorPicker from "./components/Creative&Design/ColorPicker";
import LogoMaker from "./components/Creative&Design/LogoMaker";
import BackgroundRemover from "./components/Creative&Design/BackgroundRemover";
import ImageCompressor from "./components/Creative&Design/ImageCompressor";
import FaviconGenerator from "./components/Creative&Design/FaviconGenerator";
import TextToSpeech from "./components/Text&Content/TexttoSpeech";
import MarkdownEditor from "./components/Text&Content/MarkdownEditor";
import LoremIpsum from "./components/Text&Content/LoremIpsum";
import GrammarChecker from "./components/Text&Content/GrammarChecker";
import TextCaseConverter from "./components/Text&Content/TextCaseConverter";
import CurrencyConverter from "./components/Calculators/CurrencyConverter";
import PDFTools from "./components/Text&Content/PDFTools";
import UnitConverter from "./components/Calculators/UnitConverter";
import LoanCalculator from "./components/Calculators/LoanCalculator";
import TipCalculator from "./components/Calculators/TipCalculator";
import PercentageCalculator from "./components/Calculators/PercentageCalculator";
import DateCalculator from "./components/Calculators/DateCalculator";
import HabitTracker from "./components/Productivity/HabitTracker";
import TimeZoneConverter from "./components/Calculators/TimeZoneConverter";
import ExpenseTracker from "./components/Productivity/ExpenseTracker";
import NotesApp from "./components/Productivity/NotesApp";
import URLShortener from "./components/Productivity/URLShortener";
import InvoiceGenerator from "./components/Productivity/InvoiceGenerator";
import ResumeBuilder from "./components/Productivity/ResumeBuilder";
import TicTacToe from "./components/Fun&Games/TicTacToe";
import MemoryCardGame from "./components/Fun&Games/MemoryCardGame";
import RandomPicker from "./components/Fun&Games/RandomPicker";
import DiceRoller from "./components/Fun&Games/DiceRoller";
import QuizApp from "./components/Fun&Games/QuizApp";
import DrawingBoard from "./components/Fun&Games/DrawingBoard";
import JSONFormatter from "./components/Data&Analytics/JSONFormatter";
import Base64Encoder from "./components/Data&Analytics/Base64Encoder"
import HashGenerator from "./components/Data&Analytics/HashGenerator";
import IPLookup from "./components/Data&Analytics/IPLookup";
import SpeedTest from "./components/Data&Analytics/SpeedTest";
import WebsiteScreenshot from "./components/Data&Analytics/WebsiteScreenshot";
import StockChecker from "./components/Finance&Business/StockChecker";
import CryptoTracker from "./components/Finance&Business/CryptoTracker";
import InvoiceCalculator from "./components/Finance&Business/InvoiceCalculator";
import ROICalculator from "./components/Finance&Business/ROICalculator";

function App() {

 const [activeTab, setActiveTab] = useState('home');

  const toolCategories = {
    creative: {
      name: 'Creative & Design',
      tools: [
        { id: 'qr-generator', name: 'QR Code Generator', component: QRCodeGenerator },
        { id: 'gradient', name: 'Gradient Generator', component: GradientGenerator },
        { id: 'color-picker', name: 'Color Picker', component: ColorPicker },
        { id: 'meme-generator', name: 'Meme Generator', component: MemeGenerator},
        { id: 'logo-maker', name: 'Logo Maker', component: LogoMaker },
        { id: 'bg-remover', name: 'Background Remover', component: BackgroundRemover },
        { id: 'image-compressor', name: 'Image Compressor', component: ImageCompressor  },
        { id: 'favicon', name: 'Favicon Generator', component: FaviconGenerator },
        { id: 'photo-editor', name: 'Photo Editor', component: PhotoEditor },
        { id: 'image-gen', name: 'Image Generator', component: GhibliGenerator }
      ]
    },
    text: {
      name: 'Text & Content',
      tools: [
        { id: 'text-speech', name: 'Text to Speech', component: TextToSpeech },
        { id: 'word-counter', name: 'Word Counter', component: WordCounter },
        { id: 'markdown', name: 'Markdown Editor', component: MarkdownEditor },
        { id: 'lorem', name: 'Lorem Ipsum', component: LoremIpsum},
        { id: 'grammar', name: 'Grammar Checker', component: GrammarChecker},
        { id: 'case-converter', name: 'Text Case Converter', component: TextCaseConverter },
        { id: 'pdf-tools', name: 'PDF Tools', component: PDFTools },
        { id: 'password-gen', name: 'Password Generator', component: PasswordGenerator }
      ]
    },
    calculators: {
      name: 'Calculators',
      tools: [
        { id: 'calculator', name: 'Calculator', component: Calculator },
        { id: 'bmi', name: 'BMI Calculator', component: BMICalculator },
        { id: 'currency', name: 'Currency Converter', component: CurrencyConverter },
        { id: 'unit', name: 'Unit Converter', component: UnitConverter },
        { id: 'loan', name: 'Loan Calculator', component: LoanCalculator },
        { id: 'tip', name: 'Tip Calculator', component: TipCalculator },
        { id: 'percentage', name: 'Percentage Calculator', component: PercentageCalculator },
        { id: 'date-calc', name: 'Date Calculator', component: DateCalculator },
        { id: 'timezone', name: 'Time Zone Converter', component: TimeZoneConverter },
        { id: 'age', name: 'Age Calculator', component: AgeCalculator }
      ]
    },
    productivity: {
      name: 'Productivity',
      tools: [
        { id: 'pomodoro', name: 'Pomodoro Timer', component: PomodoroTimer },
        { id: 'habit', name: 'Habit Tracker', component: HabitTracker },
        { id: 'expense', name: 'Expense Tracker', component:ExpenseTracker },
        { id: 'notes', name: 'Notes App', component: NotesApp },
        { id: 'url-shortener', name: 'URL Shortener', component: URLShortener },
        { id: 'invoice', name: 'Invoice Generator', component: InvoiceGenerator },
        { id: 'resume', name: 'Resume Builder', component: ResumeBuilder },
        { id: 'todo', name: 'Todo List', component: TodoList }
      ]
    },
    games: {
      name: 'Fun & Games',
      tools: [
        { id: 'tictactoe', name: 'Tic Tac Toe', component: TicTacToe },
        { id: 'memory', name: 'Memory Card Game', component:MemoryCardGame },
        { id: 'random-picker', name: 'Random Picker', component: RandomPicker },
        { id: 'dice', name: 'Dice Roller', component:DiceRoller },
        { id: 'quiz', name: 'Quiz App', component: QuizApp },
        { id: 'drawing', name: 'Drawing Board', component:DrawingBoard }
      ]
    },
    data: {
      name: 'Data & Analytics',
      tools: [
        { id: 'json', name: 'JSON Formatter', component: JSONFormatter },
        { id: 'base64', name: 'Base64 Encoder', component: Base64Encoder },
        { id: 'hash', name: 'Hash Generator', component:HashGenerator },
        { id: 'ip-lookup', name: 'IP Lookup', component: IPLookup },
        { id: 'speed-test', name: 'Speed Test', component: SpeedTest },
        { id: 'screenshot', name: 'Website Screenshot', component: WebsiteScreenshot }
      ]
    },
    finance: {
      name: 'Finance & Business',
      tools: [
        { id: 'stock', name: 'Stock Checker', component: StockChecker },
        { id: 'crypto', name: 'Crypto Tracker', component: CryptoTracker },
        { id: 'invoice-calc', name: 'Invoice Calculator', component: InvoiceCalculator },
        { id: 'roi', name: 'ROI Calculator', component: ROICalculator }
      ]
    }
  };


  return (
    <>
     <div className="min-h-screen bg-gradient-to-br from-[#4b4bcf] to-[#bc1f41]">
<Navbar 
   activeTab={activeTab} 
   setActiveTab={setActiveTab}
    toolCategories={toolCategories}
/>
    
<Main
   setActiveTab={setActiveTab}
 activeTab={activeTab}
toolCategories={toolCategories}
/>

<Footer
setActiveTab={setActiveTab}
//  activeTab={activeTab}
// toolCategories={toolCategories}
/>
</div>
    </>
  )
}

export default App
