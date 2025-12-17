import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

type Props = {
  contractor: any;
};

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("en-IN") : "—";

export default function ViewContractorDetailsCard({ contractor }: Props) {
  if (!contractor) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Contractor Details
          <Badge variant={contractor.isActive ? "default" : "destructive"}>
            {contractor.isActive ? "Active" : "Inactive"}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contractor / User Info */}
        <section>
          <h3 className="font-semibold mb-2">Contractor</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <b>Name:</b> {contractor.userId?.name}
            </div>
            <div>
              <b>Email:</b> {contractor.userId?.email}
            </div>
            <div>
              <b>Phone:</b> {contractor.userId?.phone}
            </div>
            <div>
              <b>Type:</b> {contractor.contractorType}
            </div>
          </div>
        </section>

        <Separator />

        {/* Company Info */}
        <section>
          <h3 className="font-semibold mb-2">Company Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <b>Company Name:</b> {contractor.companyName}
            </div>
            <div>
              <b>GST Number:</b> {contractor.gstNumber}
            </div>
            <div>
              <b>PAN Number:</b> {contractor.panCardNumber}
            </div>
          </div>
        </section>

        <Separator />

        {/* Projects */}
        <section>
          <h3 className="font-semibold mb-2">Assigned Projects</h3>
          <div className="flex flex-wrap gap-2">
            {contractor.projectsAssigned?.length ? (
              contractor.projectsAssigned.map((p: any) => (
                <Badge key={p._id} variant="secondary">
                  {p.projectName || p._id}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">
                No projects assigned
              </span>
            )}
          </div>
        </section>

        <Separator />

        {/* Financials */}
        <section>
          <h3 className="font-semibold mb-2">Financial Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <b>Total Amount:</b> ₹{contractor.amount}
            </div>
            <div>
              <b>Advance Paid:</b> ₹{contractor.advancePaid}
            </div>
            <div>
              <b>Balance:</b> ₹{contractor.balancePaid}
            </div>
          </div>
        </section>

        <Separator />

        {/* Payment Details */}
        <section>
          <h3 className="font-semibold mb-2">Payment Records</h3>
          {contractor.paymentDetails?.length ? (
            <div className="space-y-2">
              {contractor.paymentDetails.map((p: any, index: number) => (
                <div key={p._id} className="border rounded-md p-3 text-sm">
                  <div>
                    <b>Payment #{index + 1}</b>
                  </div>
                  <div>Mode: {p.modeOfPayment}</div>
                  <div>Payment Date: {formatDate(p.paymentDate)}</div>
                  <div>Last Payment Date: {formatDate(p.lastPaymentDate)}</div>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">
              No payment records
            </span>
          )}
        </section>

        <Separator />

        {/* Bank Info */}
        <section>
          <h3 className="font-semibold mb-2">Bank Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <b>Bank:</b> {contractor.bankName}
            </div>
            <div>
              <b>Branch:</b> {contractor.branchName}
            </div>
            <div>
              <b>Account No:</b> {contractor.accountNumber}
            </div>
            <div>
              <b>IFSC:</b> {contractor.ifscCode}
            </div>
          </div>
        </section>

        <Separator />

        {/* Dates */}
        <section>
          <h3 className="font-semibold mb-2">Important Dates</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <b>Contract Start:</b> {formatDate(contractor.contractStartDate)}
            </div>
            <div>
              <b>Contract End:</b> {formatDate(contractor.contractEndDate)}
            </div>
            <div>
              <b>Final Payment:</b> {formatDate(contractor.finalPaymentDate)}
            </div>
          </div>
        </section>

        <Separator />

        {/* Status Flags */}
        <section>
          <h3 className="font-semibold mb-2">Approvals</h3>
          <div className="flex gap-3">
            <Badge
              variant={
                contractor.billApprovedBySiteIncharge ? "default" : "secondary"
              }
            >
              Site Incharge Approved
            </Badge>
            <Badge
              variant={
                contractor.billProcessedByAccountant ? "default" : "secondary"
              }
            >
              Accountant Processed
            </Badge>
          </div>
        </section>

        <Separator />

        {/* Work + Bill */}
        <section>
          <h3 className="font-semibold mb-2">Work & Billing</h3>
          <div className="space-y-2 text-sm">
            <div>
              <b>Invoice No:</b> {contractor.billInvoiceNumber}
            </div>
            <div>
              <b>Billed Date:</b> {formatDate(contractor.billedDate)}
            </div>
            <div>
              <b>Work Details:</b> {contractor.workDetails}
            </div>
            {contractor.billCopy && (
              <Button variant="outline" size="sm" asChild>
                <a href={contractor.billCopy} target="_blank">
                  View Bill Copy
                </a>
              </Button>
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
