# Mise Cooking - High Priority Issues TODO

## 🔥 High Priority Issues - Detailed Subtasks

### 1. **Standardize Database Schema**

#### 1.1 Fix Table Naming Inconsistencies
- [x] **Update schema.ts**: Change `Recipe` table to lowercase `recipe` to match other tables
- [x] **Update database migrations**: Generate new migration to rename `Recipe` table to `recipe`
- [x] **Update all references**: Find and replace all `Recipe` table references with `recipe`
- [x] **Update foreign key constraints**: Fix `bookmarks_recipe_id_Recipe_id_fk` to reference correct table name
- [ ] **Test database operations**: Verify all CRUD operations work with new naming

#### 1.2 Standardize Column Naming Convention
- [ ] **Choose convention**: Decide between snake_case or camelCase (recommend snake_case for PostgreSQL)
- [ ] **Update schema.ts**: Convert all column names to chosen convention
- [ ] **Generate migration**: Create migration to rename columns consistently
- [ ] **Update TypeScript types**: Modify `Recipe` and other type definitions
- [ ] **Update all queries**: Fix column references in `backend/db/queries.ts`
- [ ] **Update frontend components**: Fix property access in React components

#### 1.3 Fix Foreign Key Relationships
- [ ] **Audit all foreign keys**: List all foreign key constraints and their naming
- [ ] **Standardize naming pattern**: Use consistent `table_column_referenced_table_fk` pattern
- [ ] **Update schema relations**: Fix Drizzle relations in `backend/db/schema.ts`
- [ ] **Test referential integrity**: Verify cascade deletes and updates work correctly

### 2. **Remove Circular Dependencies**

#### 2.1 Fix Package.json Circular Reference
- [x] **Remove circular dependency**: Delete `"mise-cooking": "."` from frontend package.json
- [x] **Audit imports**: Find any imports that might be using this circular reference
- [x] **Fix import paths**: Update any broken imports to use correct relative paths
- [ ] **Test build process**: Verify the app builds and runs without circular dependencies
- [x] **Update documentation**: Document the correct import patterns

#### 2.2 Clean Up Import Structure
- [ ] **Audit all imports**: Scan for any imports using the circular reference
- [ ] **Standardize import paths**: Use consistent relative path patterns
- [ ] **Update TypeScript config**: Ensure path mapping works correctly
- [ ] **Test module resolution**: Verify all imports resolve correctly

### 3. **Clean Up Console Logs**

#### 3.1 Create Logging Utility
- [ ] **Create logger utility**: Build `utils/logger.ts` with environment-aware logging
- [ ] **Add log levels**: Implement DEBUG, INFO, WARN, ERROR levels
- [ ] **Environment detection**: Only show debug logs in development
- [ ] **Add log formatting**: Consistent timestamp and context formatting

#### 3.2 Replace Console Statements
- [ ] **Frontend console.log**: Replace in `components/cooking/CameraTest.tsx`
- [ ] **Frontend console.error**: Replace in `services/shopping.ts`, `services/bookmarks.ts`
- [ ] **Backend console.log**: Replace in `backend/utils/recipe.ts`, `backend/server.ts`
- [ ] **Backend console.error**: Replace in `backend/db/queries.ts`, `backend/routes/`
- [ ] **Context console.error**: Replace in `contexts/AuthContext.tsx`, `contexts/CookingSessionContext.tsx`

#### 3.3 Add Production Logging
- [ ] **Error tracking**: Integrate proper error tracking service (Sentry, etc.)
- [ ] **Performance monitoring**: Add performance logging for API calls
- [ ] **User analytics**: Add non-intrusive usage analytics
- [ ] **Health monitoring**: Add health check logging

### 4. **Fix Type Safety**

#### 4.1 Replace `any` Types
- [ ] **HapticTab component**: Create proper event type for `handlePress`
- [ ] **Server error handler**: Create proper error interface for Express error handler
- [ ] **API responses**: Create typed interfaces for all API responses
- [ ] **Database queries**: Add proper return types for all database operations
- [ ] **Component props**: Ensure all component props are properly typed

#### 4.2 Add Missing Type Definitions
- [ ] **API request types**: Create interfaces for all API request bodies
- [ ] **Database models**: Ensure all database models have TypeScript interfaces
- [ ] **Component state**: Add proper typing for all React component state
- [ ] **Navigation params**: Type all navigation parameters properly
- [ ] **Form data**: Add validation schemas for all form inputs

#### 4.3 Improve Error Handling
- [ ] **Custom error classes**: Create domain-specific error classes
- [ ] **Error boundaries**: Add React error boundaries for component errors
- [ ] **API error handling**: Standardize API error response format
- [ ] **Validation errors**: Add proper validation error types
- [ ] **Network errors**: Handle network connectivity issues properly

### 5. **Consolidate Component Structure**

#### 5.1 Audit Component Locations
- [ ] **Map all components**: Create inventory of all component files and their locations
- [ ] **Identify duplicates**: Find any duplicate or similar components
- [ ] **Check usage**: Verify which components are actually being used
- [ ] **Document structure**: Create component architecture documentation

#### 5.2 Remove Unused Components
- [ ] **Delete unused directory**: Remove `/src/components/recipes/` directory
- [ ] **Remove unused files**: Delete any unused component files
- [ ] **Update imports**: Fix any broken imports from removed components
- [ ] **Test functionality**: Ensure no functionality is lost

#### 5.3 Reorganize Component Structure
- [ ] **Create component categories**: Organize by feature (auth, cooking, recipes, etc.)
- [ ] **Move components**: Relocate components to appropriate directories
- [ ] **Update import paths**: Fix all import statements after reorganization
- [ ] **Add index files**: Create barrel exports for cleaner imports
- [ ] **Document structure**: Update documentation with new organization

#### 5.4 Standardize Component Patterns
- [ ] **Component naming**: Ensure consistent naming conventions
- [ ] **File structure**: Standardize component file structure
- [ ] **Export patterns**: Use consistent export patterns
- [ ] **Prop interfaces**: Standardize prop interface naming
- [ ] **Component documentation**: Add JSDoc comments to all components

## 📋 Implementation Priority Order

1. **Start with Database Schema** (most foundational)
2. **Fix Circular Dependencies** (prevents build issues)
3. **Clean Up Console Logs** (improves production readiness)
4. **Fix Type Safety** (prevents runtime errors)
5. **Consolidate Components** (improves maintainability)

## ✅ Success Criteria for Each Subtask

- **Database**: All migrations run successfully, no naming inconsistencies
- **Dependencies**: App builds without warnings, no circular references
- **Logging**: No console statements in production, proper error tracking
- **Types**: No `any` types, all components properly typed
- **Components**: Clean directory structure, no unused files

## 🚀 Getting Started

1. **Clone the repository** and ensure you have the latest changes
2. **Set up your development environment** with all required dependencies
3. **Start with Database Schema** - this is the most foundational change
4. **Complete each subtask** and test thoroughly before moving to the next
5. **Update this TODO** as you complete tasks

## 📝 Notes

- Each subtask should be completed and tested before moving to the next one
- Create feature branches for each major section
- Update documentation as you make changes
- Consider creating automated tests for critical functionality
- Keep the team informed of progress and any blockers

## 🔍 Additional Issues Found

### Documentation Inconsistency
- **ENGINEERING_SPEC.md**: Uses `recipes` (plural) in SQL examples, but implementation uses `recipe` (singular)
- **Recommendation**: Update ENGINEERING_SPEC.md to match actual implementation or vice versa
- **Priority**: Medium - should be addressed in section 1.2 (Standardize Column Naming Convention)

## 🔄 Regular Review

- Review this TODO weekly during development
- Update priorities based on new issues discovered
- Add new tasks as they are identified
- Mark completed tasks and add completion dates 