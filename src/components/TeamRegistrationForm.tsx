import { useState } from "react";
import { X, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface TeamFormData {
  teamName: string;
  leadName: string;
  leadEmail: string;
  members: Array<{ name: string; email: string }>;
}

interface TeamRegistrationFormProps {
  isLoading?: boolean;
  loading?: boolean;
  onSubmit: (formData: TeamFormData) => void;
  onCancel?: () => void;
  defaultLeadName?: string;
  defaultLeadEmail?: string;
}

const TeamRegistrationForm = ({
  isLoading = false,
  loading = false,
  onSubmit,
  onCancel,
  defaultLeadName = "",
  defaultLeadEmail = "",
}: TeamRegistrationFormProps) => {
  const [formData, setFormData] = useState<TeamFormData>({
    teamName: "",
    leadName: defaultLeadName,
    leadEmail: defaultLeadEmail,
    members: [{ name: "", email: "" }],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate team name
    if (!formData.teamName.trim()) {
      newErrors.teamName = "Team name is required";
    }

    // Validate lead
    if (!formData.leadName.trim()) {
      newErrors.leadName = "Team lead name is required";
    }
    if (!formData.leadEmail.trim()) {
      newErrors.leadEmail = "Team lead email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.leadEmail)) {
      newErrors.leadEmail = "Invalid email format";
    }

    // Validate members
    if (formData.members.length === 0) {
      newErrors.members = "Team must have at least one member";
    }

    let memberIndex = 0;
    const seenEmails = new Set<string>();

    for (const member of formData.members) {
      if (!member.name.trim()) {
        newErrors[`member_${memberIndex}_name`] = "Name is required";
      }
      if (!member.email.trim()) {
        newErrors[`member_${memberIndex}_email`] = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
        newErrors[`member_${memberIndex}_email`] = "Invalid email format";
      } else {
        const email = member.email.toLowerCase();
        if (seenEmails.has(email)) {
          newErrors[`member_${memberIndex}_email`] = "Duplicate email";
        }
        if (email === formData.leadEmail.toLowerCase()) {
          newErrors[`member_${memberIndex}_email`] =
            "Member cannot be same as team lead";
        }
        seenEmails.add(email);
      }
      memberIndex++;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const addMember = () => {
    if (formData.members.length < 10) {
      setFormData({
        ...formData,
        members: [...formData.members, { name: "", email: "" }],
      });
    }
  };

  const removeMember = (index: number) => {
    if (formData.members.length > 1) {
      setFormData({
        ...formData,
        members: formData.members.filter((_, i) => i !== index),
      });
    }
  };

  const updateMember = (
    index: number,
    field: "name" | "email",
    value: string,
  ) => {
    const newMembers = [...formData.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData({ ...formData, members: newMembers });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert className="border-destructive/50 bg-destructive/5">
          <AlertDescription className="text-destructive">
            Please fix the errors below
          </AlertDescription>
        </Alert>
      )}

      {/* Team Name */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Team Name
        </label>
        <Input
          type="text"
          placeholder="e.g., DevMasters"
          value={formData.teamName}
          onChange={(e) =>
            setFormData({ ...formData, teamName: e.target.value })
          }
          className={errors.teamName ? "border-destructive" : ""}
        />
        {errors.teamName && (
          <p className="text-xs text-destructive mt-1">{errors.teamName}</p>
        )}
      </div>

      {/* Team Lead Section */}
      <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Users size={16} />
          Team Lead
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Name
            </label>
            <Input
              type="text"
              placeholder="Lead name"
              value={formData.leadName}
              onChange={(e) =>
                setFormData({ ...formData, leadName: e.target.value })
              }
              className={errors.leadName ? "border-destructive" : ""}
            />
            {errors.leadName && (
              <p className="text-xs text-destructive mt-1">{errors.leadName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Email
            </label>
            <Input
              type="email"
              placeholder="lead@college.edu"
              value={formData.leadEmail}
              onChange={(e) =>
                setFormData({ ...formData, leadEmail: e.target.value })
              }
              className={errors.leadEmail ? "border-destructive" : ""}
            />
            {errors.leadEmail && (
              <p className="text-xs text-destructive mt-1">
                {errors.leadEmail}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground">
            Team Members ({formData.members.length}/10)
          </h3>
          {formData.members.length < 10 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addMember}
              className="gap-1"
            >
              <Plus size={14} />
              Add Member
            </Button>
          )}
        </div>

        {errors.members && (
          <p className="text-xs text-destructive">{errors.members}</p>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {formData.members.map((member, index) => (
            <div
              key={index}
              className="flex gap-2 items-end p-3 rounded-lg bg-muted/30 border border-border"
            >
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Member name"
                    value={member.name}
                    onChange={(e) =>
                      updateMember(index, "name", e.target.value)
                    }
                    className={
                      errors[`member_${index}_name`] ? "border-destructive" : ""
                    }
                  />
                  {errors[`member_${index}_name`] && (
                    <p className="text-xs text-destructive mt-1">
                      {errors[`member_${index}_name`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="member@college.edu"
                    value={member.email}
                    onChange={(e) =>
                      updateMember(index, "email", e.target.value)
                    }
                    className={
                      errors[`member_${index}_email`]
                        ? "border-destructive"
                        : ""
                    }
                  />
                  {errors[`member_${index}_email`] && (
                    <p className="text-xs text-destructive mt-1">
                      {errors[`member_${index}_email`]}
                    </p>
                  )}
                </div>
              </div>

              {formData.members.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeMember(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading || loading} className="gap-2">
          {isLoading || loading ? "Registering..." : "Register Team"}
        </Button>
      </div>
    </form>
  );
};

export default TeamRegistrationForm;
