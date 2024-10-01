import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "@/components/ui/spinner";
import useErrorHandler from "@/hooks/useError";
import {
  getReportTypeList,
  uploadPostTreatmentReport,
} from "@/https/admin-service";
import { IMedicalReportType } from "@/types";
import { UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const UploadReport = ({
  patientId,
  updateMedicalReport,
  appointmentId,
}: {
  patientId: string;
  updateMedicalReport: () => void;
  appointmentId: string;
}) => {
  const [reportTypeList, setReportTypeList] = useState<IMedicalReportType[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [files, setFiles] = useState<File | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);

  const handleError = useErrorHandler();

  const fetchReportTypeList = async () => {
    try {
      setLoading(true);
      const res = await getReportTypeList();
      setReportTypeList(res.data.data);
    } catch (error) {
      handleError(error, "Failed to fetch report type list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportTypeList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFiles(null);
      setReportType("");
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  const handleUploadDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const isValid =
        file.type.startsWith("image/") || file.type === "application/pdf";
      if (!isValid) {
        toast.error(`Invalid file type: ${file.name}`, {
          description: "Only images and pdf files are allowed",
        });
      } else {
        setFiles(file);
      }
    }
  };

  const uploadDocs = async () => {
    try {
      if (!reportType) {
        return toast.error("Please select a report type");
      }
      setSubmittingReport(true);
      const formData = new FormData();
      if (files) {
        formData.append("files", files);
      }
      const documentType = reportTypeList.find(
        (type: IMedicalReportType) => type.id === reportType,
      );
      await uploadPostTreatmentReport(
        formData,
        patientId,
        documentType!.id,
        appointmentId,
      );
      setReportType("");
      toast.success("Uploaded Successfully", {
        description: "Your report has been uploaded successfully!",
      });
      updateMedicalReport();
      setOpen(false);
    } catch (error) {
      handleError(error, "Failed to upload report");
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <>
        <Spinner />
        Please wait...
      </>
    );
  }
  return (
    <Dialog onOpenChange={handleChange} open={open}>
      <DialogTrigger asChild className="flex">
        <Button className="w-fit" size="sm">
          <div className="flex gap-1 items-center">
            <UploadCloud className="w-4 h-4" />
            Upload
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[360px] md:max-w-fit rounded-lg">
        <DialogHeader>
          <DialogTitle>Upload Post Treatment Report</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-6 items-center ">
            <Label htmlFor="username">Type</Label>
            <Select
              onValueChange={(option) => setReportType(option)}
              value={reportType}
            >
              <SelectTrigger className="col-span-5">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {reportTypeList.map((type: { id: string; name: string }) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-6 items-center ">
            <Label htmlFor="name">Report</Label>
            <Input
              id="report"
              className="col-span-5"
              type="file"
              accept=".png, .jpeg, .jpg, .pdf"
              onChange={handleUploadDocChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!files || reportType === "" || submittingReport}
            onClick={uploadDocs}
          >
            {submittingReport ? (
              <>
                <Spinner type="light" />
                {submittingReport && "Uploading..."}
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadReport;
