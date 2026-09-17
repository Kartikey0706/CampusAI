export type ComplaintStatus = "Pending" | "Under Review" | "In Progress" | "Resolved" | "Assigned" | "Rejected";
export type Priority = "Pending" | "Low" | "Medium" | "High";

export interface SimilarComplaint {
	complaint_id: string;
	title: string;
	description?: string;
	category?: string;
	department?: string;
	urgency?: string;
	priority?: string | number;
	status?: ComplaintStatus;
	similarity_score?: number;
	similarity_percentage?: number;
}

export interface Complaint {
	id?: string;
	complaint_id: string;
	student_id?: string;
	student_roll_no?: string;
	title: string;
	description: string;
	location: string;
	evidence?: string | null;
	category: string;
	sentiment: string;
	urgency: string;
	department: string;
	priority: string | number;
	status: ComplaintStatus;
	created_at: string;
	updated_at: string;
	similar_complaints?: SimilarComplaint[];
}
