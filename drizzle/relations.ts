import { relations } from "drizzle-orm/relations";
import { grantOpportunities, grantApplications, grantDocuments, grantReporting, onboardingJourneys, onboardingAssessments } from "./schema";

export const grantApplicationsRelations = relations(grantApplications, ({one, many}) => ({
	grantOpportunity: one(grantOpportunities, {
		fields: [grantApplications.opportunityId],
		references: [grantOpportunities.id]
	}),
	grantDocuments: many(grantDocuments),
	grantReportings: many(grantReporting),
}));

export const grantOpportunitiesRelations = relations(grantOpportunities, ({many}) => ({
	grantApplications: many(grantApplications),
}));

export const grantDocumentsRelations = relations(grantDocuments, ({one}) => ({
	grantApplication: one(grantApplications, {
		fields: [grantDocuments.applicationId],
		references: [grantApplications.id]
	}),
}));

export const grantReportingRelations = relations(grantReporting, ({one}) => ({
	grantApplication: one(grantApplications, {
		fields: [grantReporting.applicationId],
		references: [grantApplications.id]
	}),
}));

export const onboardingJourneysRelations = relations(onboardingJourneys, ({many}) => ({
	assessments: many(onboardingAssessments),
}));

export const onboardingAssessmentsRelations = relations(onboardingAssessments, ({one}) => ({
	journey: one(onboardingJourneys, {
		fields: [onboardingAssessments.journeyId],
		references: [onboardingJourneys.id],
	}),
}));