import { forwardRef } from "react"
import {
  Activity01Icon,
  Add01Icon,
  Alert02Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  Building03Icon,
  Calculator01Icon,
  Calendar03Icon,
  CalendarAdd01Icon,
  CalendarDaysIcon,
  Call02Icon,
  Cancel01Icon,
  CancelCircleIcon,
  CheckListIcon,
  CheckmarkCircle02Icon,
  CircleDotIcon,
  ClipboardListIcon,
  ClipboardPlusIcon,
  Clock01Icon,
  ContrastIcon,
  Copy01Icon,
  CreditCardIcon,
  Delete02Icon,
  DoorOpenIcon,
  Download01Icon,
  DropletIcon,
  Edit02Icon,
  Edit03Icon,
  FavouriteIcon,
  FileCheckIcon,
  FileQuestionMarkIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FilterIcon,
  HandshakeIcon,
  HeadphonesIcon,
  Home01Icon,
  InformationCircleIcon,
  LinkSquare02Icon,
  Loading03Icon,
  Location01Icon,
  LockIcon,
  Mail01Icon,
  Money01Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  PrinterIcon,
  QrCodeIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  RotateCwIcon,
  ScaleIcon,
  ScanIcon,
  Search01Icon,
  SecurityCheckIcon,
  Stethoscope02Icon,
  TestTube01Icon,
  ThermometerIcon,
  Tick02Icon,
  Upload01Icon,
  UserAdd01Icon,
  UserCheck01Icon,
  UserCogIcon,
  UserGroupIcon,
  UserIcon,
  UserRemove01Icon,
  ViewIcon,
  ViewOffIcon,
  WindIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@hugeicons/core-free-icons"
import {
  HugeiconsIcon,
  type HugeiconsProps,
  type IconSvgElement,
} from "@hugeicons/react"

export type ProductIconProps = Omit<HugeiconsProps, "altIcon" | "icon">

function createProductIcon(icon: IconSvgElement, displayName: string) {
  const ProductIcon = forwardRef<SVGSVGElement, ProductIconProps>(
    (props, ref) => (
      <HugeiconsIcon ref={ref} icon={icon} {...props} data-slot="product-icon" />
    )
  )

  ProductIcon.displayName = displayName
  return ProductIcon
}

export const Activity = createProductIcon(Activity01Icon, "Activity")
export const AlertCircle = createProductIcon(AlertCircleIcon, "AlertCircle")
export const AlertTriangle = createProductIcon(Alert02Icon, "AlertTriangle")
export const ArrowLeft = createProductIcon(ArrowLeft02Icon, "ArrowLeft")
export const Banknote = createProductIcon(Money01Icon, "Banknote")
export const Building2 = createProductIcon(Building03Icon, "Building2")
export const Calculator = createProductIcon(Calculator01Icon, "Calculator")
export const Calendar = createProductIcon(Calendar03Icon, "Calendar")
export const CalendarDays = createProductIcon(CalendarDaysIcon, "CalendarDays")
export const CalendarIcon = createProductIcon(Calendar03Icon, "CalendarIcon")
export const CalendarPlus = createProductIcon(CalendarAdd01Icon, "CalendarPlus")
export const Check = createProductIcon(Tick02Icon, "Check")
export const CheckCircle2 = createProductIcon(CheckmarkCircle02Icon, "CheckCircle2")
export const ChevronDown = createProductIcon(ArrowDown01Icon, "ChevronDown")
export const ChevronLeft = createProductIcon(ArrowLeft01Icon, "ChevronLeft")
export const ChevronRight = createProductIcon(ArrowRight01Icon, "ChevronRight")
export const CircleDot = createProductIcon(CircleDotIcon, "CircleDot")
export const ClipboardList = createProductIcon(ClipboardListIcon, "ClipboardList")
export const ClipboardPlus = createProductIcon(ClipboardPlusIcon, "ClipboardPlus")
export const Clock = createProductIcon(Clock01Icon, "Clock")
export const Contrast = createProductIcon(ContrastIcon, "Contrast")
export const Copy = createProductIcon(Copy01Icon, "Copy")
export const CreditCard = createProductIcon(CreditCardIcon, "CreditCard")
export const DoorOpen = createProductIcon(DoorOpenIcon, "DoorOpen")
export const Download = createProductIcon(Download01Icon, "Download")
export const Droplet = createProductIcon(DropletIcon, "Droplet")
export const Edit = createProductIcon(Edit02Icon, "Edit")
export const Edit3 = createProductIcon(Edit03Icon, "Edit3")
export const ExternalLink = createProductIcon(LinkSquare02Icon, "ExternalLink")
export const Eye = createProductIcon(ViewIcon, "Eye")
export const EyeOff = createProductIcon(ViewOffIcon, "EyeOff")
export const FileCheck = createProductIcon(FileCheckIcon, "FileCheck")
export const FileQuestion = createProductIcon(FileQuestionMarkIcon, "FileQuestion")
export const FileSpreadsheet = createProductIcon(FileSpreadsheetIcon, "FileSpreadsheet")
export const FileText = createProductIcon(FileTextIcon, "FileText")
export const Filter = createProductIcon(FilterIcon, "Filter")
export const FlaskConical = createProductIcon(TestTube01Icon, "FlaskConical")
export const Headphones = createProductIcon(HeadphonesIcon, "Headphones")
export const Heart = createProductIcon(FavouriteIcon, "Heart")
export const HeartHandshake = createProductIcon(HandshakeIcon, "HeartHandshake")
export const Home = createProductIcon(Home01Icon, "Home")
export const Info = createProductIcon(InformationCircleIcon, "Info")
export const ListChecks = createProductIcon(CheckListIcon, "ListChecks")
export const Loader2 = createProductIcon(Loading03Icon, "Loader2")
export const Lock = createProductIcon(LockIcon, "Lock")
export const Mail = createProductIcon(Mail01Icon, "Mail")
export const MapPin = createProductIcon(Location01Icon, "MapPin")
export const MoreHorizontal = createProductIcon(MoreHorizontalIcon, "MoreHorizontal")
export const Pencil = createProductIcon(PencilEdit01Icon, "Pencil")
export const Phone = createProductIcon(Call02Icon, "Phone")
export const Plus = createProductIcon(Add01Icon, "Plus")
export const Printer = createProductIcon(PrinterIcon, "Printer")
export const QrCode = createProductIcon(QrCodeIcon, "QrCode")
export const RefreshCw = createProductIcon(RefreshCwIcon, "RefreshCw")
export const RotateCcw = createProductIcon(RotateCcwIcon, "RotateCcw")
export const RotateCw = createProductIcon(RotateCwIcon, "RotateCw")
export const Scale = createProductIcon(ScaleIcon, "Scale")
export const Scan = createProductIcon(ScanIcon, "Scan")
export const Search = createProductIcon(Search01Icon, "Search")
export const ShieldCheck = createProductIcon(SecurityCheckIcon, "ShieldCheck")
export const Stethoscope = createProductIcon(Stethoscope02Icon, "Stethoscope")
export const Thermometer = createProductIcon(ThermometerIcon, "Thermometer")
export const Trash2 = createProductIcon(Delete02Icon, "Trash2")
export const Upload = createProductIcon(Upload01Icon, "Upload")
export const User = createProductIcon(UserIcon, "User")
export const UserCheck = createProductIcon(UserCheck01Icon, "UserCheck")
export const UserCog = createProductIcon(UserCogIcon, "UserCog")
export const UserPlus = createProductIcon(UserAdd01Icon, "UserPlus")
export const Users = createProductIcon(UserGroupIcon, "Users")
export const UserX = createProductIcon(UserRemove01Icon, "UserX")
export const Wind = createProductIcon(WindIcon, "Wind")
export const X = createProductIcon(Cancel01Icon, "X")
export const XCircle = createProductIcon(CancelCircleIcon, "XCircle")
export const ZoomIn = createProductIcon(ZoomInIcon, "ZoomIn")
export const ZoomOut = createProductIcon(ZoomOutIcon, "ZoomOut")
