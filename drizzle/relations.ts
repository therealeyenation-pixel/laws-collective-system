import { relations } from "drizzle-orm/relations";
import { users, channelAccess, iptvChannels, houseContracts, contractMilestones, designSubmissions, designReviews, governmentAgencies, governmentActions, grantOpportunities, grantApplications, grantDocuments, grantReporting, iptvStreams, lawsPositions, lawsApplications, houseLedgers, ledgerTransactions, softwareLicenses, licenseAssignments, licenseRenewals, streamingPlaylists, playlistItems, positionFunding, servicePackages, serviceInvoices, servicePayments, softwareCategories, stateTaxRates, stateTaxBrackets, subscriptionEvents, trialUsers, trialExitSurveys, trialFeatureExploration, trialFeedback, trialPageViews, trialSessions, trialSampleData, userFavorites, userPlaybackHistory, userSubscriptions } from "./schema";

export const channelAccessRelations = relations(channelAccess, ({one}) => ({
	user: one(users, {
		fields: [channelAccess.userId],
		references: [users.id]
	}),
	iptvChannel: one(iptvChannels, {
		fields: [channelAccess.channelId],
		references: [iptvChannels.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	channelAccesses: many(channelAccess),
	subscriptionEvents: many(subscriptionEvents),
	userFavorites: many(userFavorites),
	userPlaybackHistories: many(userPlaybackHistory),
	userSubscriptions: many(userSubscriptions),
}));

export const iptvChannelsRelations = relations(iptvChannels, ({many}) => ({
	channelAccesses: many(channelAccess),
	iptvStreams: many(iptvStreams),
}));

export const contractMilestonesRelations = relations(contractMilestones, ({one}) => ({
	houseContract: one(houseContracts, {
		fields: [contractMilestones.contractId],
		references: [houseContracts.id]
	}),
}));

export const houseContractsRelations = relations(houseContracts, ({many}) => ({
	contractMilestones: many(contractMilestones),
}));

export const designReviewsRelations = relations(designReviews, ({one}) => ({
	designSubmission: one(designSubmissions, {
		fields: [designReviews.submissionId],
		references: [designSubmissions.id]
	}),
}));

export const designSubmissionsRelations = relations(designSubmissions, ({many}) => ({
	designReviews: many(designReviews),
}));

export const governmentActionsRelations = relations(governmentActions, ({one}) => ({
	governmentAgency: one(governmentAgencies, {
		fields: [governmentActions.agencyId],
		references: [governmentAgencies.id]
	}),
}));

export const governmentAgenciesRelations = relations(governmentAgencies, ({many}) => ({
	governmentActions: many(governmentActions),
}));

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

export const iptvStreamsRelations = relations(iptvStreams, ({one}) => ({
	iptvChannel: one(iptvChannels, {
		fields: [iptvStreams.channelId],
		references: [iptvChannels.id]
	}),
}));

export const lawsApplicationsRelations = relations(lawsApplications, ({one}) => ({
	lawsPosition: one(lawsPositions, {
		fields: [lawsApplications.positionId],
		references: [lawsPositions.id]
	}),
}));

export const lawsPositionsRelations = relations(lawsPositions, ({many}) => ({
	lawsApplications: many(lawsApplications),
	positionFundings: many(positionFunding),
}));

export const ledgerTransactionsRelations = relations(ledgerTransactions, ({one}) => ({
	houseLedger: one(houseLedgers, {
		fields: [ledgerTransactions.ledgerId],
		references: [houseLedgers.id]
	}),
}));

export const houseLedgersRelations = relations(houseLedgers, ({many}) => ({
	ledgerTransactions: many(ledgerTransactions),
}));

export const licenseAssignmentsRelations = relations(licenseAssignments, ({one}) => ({
	softwareLicense: one(softwareLicenses, {
		fields: [licenseAssignments.licenseId],
		references: [softwareLicenses.id]
	}),
}));

export const softwareLicensesRelations = relations(softwareLicenses, ({one, many}) => ({
	licenseAssignments: many(licenseAssignments),
	licenseRenewals: many(licenseRenewals),
	softwareCategory: one(softwareCategories, {
		fields: [softwareLicenses.categoryId],
		references: [softwareCategories.id]
	}),
}));

export const licenseRenewalsRelations = relations(licenseRenewals, ({one}) => ({
	softwareLicense: one(softwareLicenses, {
		fields: [licenseRenewals.licenseId],
		references: [softwareLicenses.id]
	}),
}));

export const playlistItemsRelations = relations(playlistItems, ({one}) => ({
	streamingPlaylist: one(streamingPlaylists, {
		fields: [playlistItems.playlistId],
		references: [streamingPlaylists.id]
	}),
}));

export const streamingPlaylistsRelations = relations(streamingPlaylists, ({many}) => ({
	playlistItems: many(playlistItems),
}));

export const positionFundingRelations = relations(positionFunding, ({one}) => ({
	lawsPosition: one(lawsPositions, {
		fields: [positionFunding.positionId],
		references: [lawsPositions.id]
	}),
}));

export const serviceInvoicesRelations = relations(serviceInvoices, ({one, many}) => ({
	servicePackage: one(servicePackages, {
		fields: [serviceInvoices.packageId],
		references: [servicePackages.id]
	}),
	servicePayments: many(servicePayments),
}));

export const servicePackagesRelations = relations(servicePackages, ({many}) => ({
	serviceInvoices: many(serviceInvoices),
}));

export const servicePaymentsRelations = relations(servicePayments, ({one}) => ({
	serviceInvoice: one(serviceInvoices, {
		fields: [servicePayments.invoiceId],
		references: [serviceInvoices.id]
	}),
}));

export const softwareCategoriesRelations = relations(softwareCategories, ({many}) => ({
	softwareLicenses: many(softwareLicenses),
}));

export const stateTaxBracketsRelations = relations(stateTaxBrackets, ({one}) => ({
	stateTaxRate: one(stateTaxRates, {
		fields: [stateTaxBrackets.stateTaxRateId],
		references: [stateTaxRates.id]
	}),
}));

export const stateTaxRatesRelations = relations(stateTaxRates, ({many}) => ({
	stateTaxBrackets: many(stateTaxBrackets),
}));

export const subscriptionEventsRelations = relations(subscriptionEvents, ({one}) => ({
	user: one(users, {
		fields: [subscriptionEvents.userId],
		references: [users.id]
	}),
}));

export const trialExitSurveysRelations = relations(trialExitSurveys, ({one}) => ({
	trialUser: one(trialUsers, {
		fields: [trialExitSurveys.trialUserId],
		references: [trialUsers.id]
	}),
}));

export const trialUsersRelations = relations(trialUsers, ({many}) => ({
	trialExitSurveys: many(trialExitSurveys),
	trialFeatureExplorations: many(trialFeatureExploration),
	trialFeedbacks: many(trialFeedback),
	trialPageViews: many(trialPageViews),
	trialSampleData: many(trialSampleData),
	trialSessions: many(trialSessions),
}));

export const trialFeatureExplorationRelations = relations(trialFeatureExploration, ({one}) => ({
	trialUser: one(trialUsers, {
		fields: [trialFeatureExploration.trialUserId],
		references: [trialUsers.id]
	}),
}));

export const trialFeedbackRelations = relations(trialFeedback, ({one}) => ({
	trialUser: one(trialUsers, {
		fields: [trialFeedback.trialUserId],
		references: [trialUsers.id]
	}),
}));

export const trialPageViewsRelations = relations(trialPageViews, ({one}) => ({
	trialUser: one(trialUsers, {
		fields: [trialPageViews.trialUserId],
		references: [trialUsers.id]
	}),
	trialSession: one(trialSessions, {
		fields: [trialPageViews.trialSessionId],
		references: [trialSessions.id]
	}),
}));

export const trialSessionsRelations = relations(trialSessions, ({one, many}) => ({
	trialPageViews: many(trialPageViews),
	trialUser: one(trialUsers, {
		fields: [trialSessions.trialUserId],
		references: [trialUsers.id]
	}),
}));

export const trialSampleDataRelations = relations(trialSampleData, ({one}) => ({
	trialUser: one(trialUsers, {
		fields: [trialSampleData.trialUserId],
		references: [trialUsers.id]
	}),
}));

export const userFavoritesRelations = relations(userFavorites, ({one}) => ({
	user: one(users, {
		fields: [userFavorites.userId],
		references: [users.id]
	}),
}));

export const userPlaybackHistoryRelations = relations(userPlaybackHistory, ({one}) => ({
	user: one(users, {
		fields: [userPlaybackHistory.userId],
		references: [users.id]
	}),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({one}) => ({
	user: one(users, {
		fields: [userSubscriptions.userId],
		references: [users.id]
	}),
}));