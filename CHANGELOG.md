# Changelog

All notable changes to this project will be documented in this file.

The format is based on Conventional Commits.

## [Unreleased]
- Publisher Program groundwork: migration adds user role & publisher request workflow columns; feature flag `publisher_program` (disabled by default).
- Auth enhancements: role-aware helpers (`getUserWithRole`, `requirePublisherOrAdmin`). Auto-promote configured admin email to `admin` role.
- Blog creation: publishers (when flag enabled) can create draft posts (cannot directly publish or feature). Admin behavior unchanged.
- New endpoints:
	- `POST /api/profile/publisher-request` (and GET) for users to request publisher status.
	- `GET /api/profile/publisher-requests` list pending requests (admin).
	- `POST /api/profile/publisher-approval` approve/reject requests (admin).
- Feature flag seed for `publisher_program` to gate new functionality.
- UI: Share button added to blog post detail page with Web Share API + clipboard fallback.
- Initialize changelog infrastructure (hooks, linting, scope suggestions, conventional changelog script)
