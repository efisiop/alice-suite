"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ALICE_BOOK_ID_STRING: () => ALICE_BOOK_ID_STRING,
  ALICE_BOOK_ID_UUID: () => ALICE_BOOK_ID_UUID,
  FeedbackType: () => FeedbackType,
  HelpRequestStatus: () => HelpRequestStatus,
  TriggerType: () => TriggerType,
  asBookId: () => asBookId,
  asChapterId: () => asChapterId,
  asConsultantActionId: () => asConsultantActionId,
  asConsultantTriggerId: () => asConsultantTriggerId,
  asDictionaryId: () => asDictionaryId,
  asFeedbackId: () => asFeedbackId,
  asHelpRequestId: () => asHelpRequestId,
  asProfileId: () => asProfileId,
  asReadingProgressId: () => asReadingProgressId,
  asReadingStatsId: () => asReadingStatsId,
  asSectionId: () => asSectionId,
  asUserId: () => asUserId,
  authClient: () => authClient,
  createSupabaseClient: () => createSupabaseClient,
  dbClient: () => dbClient,
  generateUuid: () => generateUuid,
  getBookStringId: () => getBookStringId,
  getBookUuid: () => getBookUuid,
  getSupabaseClient: () => getSupabaseClient,
  initializeSupabase: () => initializeSupabase,
  isUuid: () => isUuid,
  supabase: () => supabase,
  validateSupabaseConfig: () => validateSupabaseConfig,
  validateUuid: () => validateUuid
});
module.exports = __toCommonJS(index_exports);

// src/utils/supabase.ts
var import_supabase_js = require("@supabase/supabase-js");
var supabaseConfig = null;
var supabaseInstance = null;
var createSupabaseClient = (url, anonKey) => {
  if (!url || !anonKey) {
    throw new Error("supabaseUrl and supabaseAnonKey are required.");
  }
  return (0, import_supabase_js.createClient)(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
};
var initializeSupabase = (config) => {
  supabaseConfig = config;
  supabaseInstance = createSupabaseClient(config.url, config.anonKey);
  return supabaseInstance;
};
var getSupabaseClient = () => {
  if (!supabaseInstance) {
    throw new Error("Supabase client not initialized. Call initializeSupabase() first with your environment variables.");
  }
  return supabaseInstance;
};
var supabase = () => getSupabaseClient();
function validateSupabaseConfig(config) {
  return !!(config.url && config.anonKey);
}

// src/auth/auth-client.ts
var AuthClient = class {
  get supabase() {
    return getSupabaseClient();
  }
  async signIn(credentials) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      if (error) {
        return { user: null, error: { message: error.message, code: error.code } };
      }
      if (!data.user) {
        return { user: null, error: { message: "No user found" } };
      }
      const { data: profile, error: profileError } = await this.supabase.from("profiles").select("*").eq("id", data.user.id).single();
      if (profileError) {
        return { user: null, error: { message: profileError.message } };
      }
      const user = {
        id: data.user.id,
        email: data.user.email,
        role: profile.is_consultant ? "consultant" : "reader",
        fullName: `${profile.first_name} ${profile.last_name}`,
        firstName: profile.first_name,
        lastName: profile.last_name,
        isConsultant: profile.is_consultant
      };
      return { user, error: null };
    } catch (error) {
      return { user: null, error: { message: "An unexpected error occurred" } };
    }
  }
  async signUp(credentials) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password
      });
      if (error) {
        return { user: null, error: { message: error.message, code: error.code } };
      }
      if (!data.user) {
        return { user: null, error: { message: "User creation failed" } };
      }
      const profileData = {
        id: data.user.id,
        first_name: credentials.firstName,
        last_name: credentials.lastName,
        email: credentials.email,
        is_consultant: credentials.isConsultant || false,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const { error: profileError } = await this.supabase.from("profiles").insert(profileData);
      if (profileError) {
        return { user: null, error: { message: profileError.message } };
      }
      const user = {
        id: data.user.id,
        email: data.user.email,
        role: profileData.is_consultant ? "consultant" : "reader",
        fullName: `${profileData.first_name} ${profileData.last_name}`,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        isConsultant: profileData.is_consultant
      };
      return { user, error: null };
    } catch (error) {
      return { user: null, error: { message: "An unexpected error occurred" } };
    }
  }
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      return { error: error ? { message: error.message } : null };
    } catch (error) {
      return { error: { message: "An unexpected error occurred" } };
    }
  }
  async getCurrentUser() {
    try {
      const { data: { user: authUser }, error: authError } = await this.supabase.auth.getUser();
      if (authError || !authUser) {
        return { user: null, error: authError ? { message: authError.message } : null };
      }
      const { data: profile, error: profileError } = await this.supabase.from("profiles").select("*").eq("id", authUser.id).single();
      if (profileError) {
        return { user: null, error: { message: profileError.message } };
      }
      const user = {
        id: authUser.id,
        email: authUser.email,
        role: profile.is_consultant ? "consultant" : "reader",
        fullName: `${profile.first_name} ${profile.last_name}`,
        firstName: profile.first_name,
        lastName: profile.last_name,
        isConsultant: profile.is_consultant
      };
      return { user, error: null };
    } catch (error) {
      return { user: null, error: { message: "An unexpected error occurred" } };
    }
  }
  async updateProfile(updates) {
    try {
      const { data: { user: authUser }, error: authError } = await this.supabase.auth.getUser();
      if (authError || !authUser) {
        return { user: null, error: { message: "Not authenticated" } };
      }
      const { data: profile, error: profileError } = await this.supabase.from("profiles").update({ ...updates, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", authUser.id).select().single();
      if (profileError) {
        return { user: null, error: { message: profileError.message } };
      }
      const user = {
        id: authUser.id,
        email: authUser.email,
        role: profile.is_consultant ? "consultant" : "reader",
        fullName: `${profile.first_name} ${profile.last_name}`,
        firstName: profile.first_name,
        lastName: profile.last_name,
        isConsultant: profile.is_consultant
      };
      return { user, error: null };
    } catch (error) {
      return { user: null, error: { message: "An unexpected error occurred" } };
    }
  }
  onAuthStateChange(callback) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback({ event, session });
    });
  }
  async resetPassword(email) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      return { error: error ? { message: error.message } : null };
    } catch (error) {
      return { error: { message: "An unexpected error occurred" } };
    }
  }
  async emitAuthEvent(event) {
    try {
      const realtimeUrl = process.env.REACT_APP_REALTIME_URL || "http://localhost:3001";
      const response = await fetch(`${realtimeUrl}/api/auth-events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(event)
      });
      if (!response.ok) {
        throw new Error(`Failed to emit auth event: ${response.statusText}`);
      }
      return { error: null };
    } catch (error) {
      console.warn("Failed to emit auth event:", error);
      return { error: { message: "Failed to emit auth event" } };
    }
  }
};
var authClient = new AuthClient();

// src/database/database-client.ts
var DatabaseClient = class {
  get supabase() {
    return getSupabaseClient();
  }
  // Profile operations
  async getProfile(userId) {
    const { data, error } = await this.supabase.from("profiles").select("*").eq("id", userId).single();
    return { data, error };
  }
  async updateProfile(userId, updates) {
    const { data, error } = await this.supabase.from("profiles").update({ ...updates, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", userId).select().single();
    return { data, error };
  }
  // Book operations
  async getBook(bookId) {
    const { data, error } = await this.supabase.from("books").select("*").eq("id", bookId).single();
    return { data, error };
  }
  async getBookWithChapters(bookId) {
    const { data: book, error: bookError } = await this.supabase.from("books").select("*").eq("id", bookId).single();
    if (bookError) return { data: null, error: bookError };
    const { data: chapters, error: chaptersError } = await this.supabase.from("chapters").select(`
        *,
        sections (*)
      `).eq("book_id", bookId).order("number");
    if (chaptersError) return { data: null, error: chaptersError };
    const bookWithChapters = {
      ...book,
      chapters: chapters || []
    };
    return { data: bookWithChapters, error: null };
  }
  // Chapter operations
  async getChapters(bookId) {
    const { data, error } = await this.supabase.from("chapters").select("*").eq("book_id", bookId).order("number");
    return { data, error };
  }
  // Section operations
  async getSections(chapterId) {
    const { data, error } = await this.supabase.from("sections").select("*").eq("chapter_id", chapterId).order("number");
    return { data, error };
  }
  async getSection(sectionId) {
    const { data, error } = await this.supabase.from("sections").select("*").eq("id", sectionId).single();
    return { data, error };
  }
  async getSectionsForPage(bookId, pageNumber) {
    const { data, error } = await this.supabase.rpc("get_sections_for_page", {
      book_id_param: bookId,
      page_number_param: pageNumber
    });
    return { data, error };
  }
  // Reading progress operations
  async getReadingProgress(userId, bookId) {
    const { data, error } = await this.supabase.from("reading_progress").select("*").eq("user_id", userId).eq("book_id", bookId).order("last_read_at", { ascending: false });
    return { data, error };
  }
  async updateReadingProgress(progress) {
    const { data, error } = await this.supabase.from("reading_progress").upsert({
      ...progress,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    return { data, error };
  }
  // Reading stats operations
  async getReadingStats(userId, bookId) {
    const { data, error } = await this.supabase.from("reading_stats").select("*").eq("user_id", userId).eq("book_id", bookId).single();
    return { data, error };
  }
  async updateReadingStats(stats) {
    const { data, error } = await this.supabase.from("reading_stats").upsert({
      ...stats,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    return { data, error };
  }
  // User feedback operations
  async getUserFeedback(userId, bookId) {
    const { data, error } = await this.supabase.from("user_feedback").select("*").eq("user_id", userId).eq("book_id", bookId).order("created_at", { ascending: false });
    return { data, error };
  }
  async createUserFeedback(feedback) {
    const { data, error } = await this.supabase.from("user_feedback").insert({
      ...feedback,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    return { data, error };
  }
  // Help request operations
  async getHelpRequests(userId) {
    const { data, error } = await this.supabase.from("help_requests").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    return { data, error };
  }
  async createHelpRequest(request) {
    const { data, error } = await this.supabase.from("help_requests").insert({
      ...request,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    return { data, error };
  }
  async updateHelpRequestStatus(requestId, status, assignToSelf) {
    const { data, error } = await this.supabase.rpc("update_help_request_status", {
      p_request_id: requestId,
      p_status: status,
      p_assign_to_self: assignToSelf
    });
    return { data, error };
  }
  // Consultant operations
  async getConsultantTriggers(consultantId) {
    const { data, error } = await this.supabase.from("consultant_triggers").select("*").eq("consultant_id", consultantId).eq("is_processed", false).order("created_at", { ascending: false });
    return { data, error };
  }
  async createConsultantTrigger(trigger) {
    const { data, error } = await this.supabase.rpc("create_consultant_trigger", {
      p_user_id: trigger.user_id,
      p_book_id: trigger.book_id,
      p_trigger_type: trigger.trigger_type,
      p_message: trigger.message
    });
    if (error) return { data: null, error };
    const { data: createdTrigger, error: fetchError } = await this.supabase.from("consultant_triggers").select("*").eq("id", data).single();
    return { data: createdTrigger, error: fetchError };
  }
  async logConsultantAction(action) {
    const { data, error } = await this.supabase.rpc("log_consultant_action", {
      p_user_id: action.user_id,
      p_action_type: action.action_type,
      p_details: action.details
    });
    if (error) return { data: null, error };
    const { data: createdAction, error: fetchError } = await this.supabase.from("consultant_actions_log").select("*").eq("id", data).single();
    return { data: createdAction, error: fetchError };
  }
};
var dbClient = new DatabaseClient();

// src/utils/id-utils.ts
function isUuid(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
function asUserId(id) {
  return id;
}
function asBookId(id) {
  return id;
}
function asChapterId(id) {
  return id;
}
function asSectionId(id) {
  return id;
}
function asProfileId(id) {
  return id;
}
function asDictionaryId(id) {
  return id;
}
function asReadingProgressId(id) {
  return id;
}
function asReadingStatsId(id) {
  return id;
}
function asHelpRequestId(id) {
  return id;
}
function asFeedbackId(id) {
  return id;
}
function asConsultantTriggerId(id) {
  return id;
}
function asConsultantActionId(id) {
  return id;
}
var BOOK_ID_MAP = {
  "alice-in-wonderland": "550e8400-e29b-41d4-a716-446655440000"
  // Add more mappings as needed
};
function getBookUuid(bookId) {
  if (isUuid(bookId)) {
    return asBookId(bookId);
  }
  const uuid = BOOK_ID_MAP[bookId];
  if (uuid) {
    console.log(`[IdUtils] Converted string ID "${bookId}" to UUID "${uuid}"`);
    return asBookId(uuid);
  }
  console.warn(`[IdUtils] No UUID mapping found for book ID "${bookId}"`);
  return asBookId(bookId);
}
function getBookStringId(uuid) {
  for (const [stringId, bookUuid] of Object.entries(BOOK_ID_MAP)) {
    if (bookUuid === uuid) {
      console.log(`[IdUtils] Converted UUID "${uuid}" to string ID "${stringId}"`);
      return stringId;
    }
  }
  console.warn(`[IdUtils] No string ID mapping found for UUID "${uuid}"`);
  return uuid;
}
function validateUuid(id) {
  return isUuid(id);
}
function generateUuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
var ALICE_BOOK_ID_STRING = "alice-in-wonderland";
var ALICE_BOOK_ID_UUID = asBookId("550e8400-e29b-41d4-a716-446655440000");

// src/types/database.ts
var FeedbackType = /* @__PURE__ */ ((FeedbackType2) => {
  FeedbackType2["AHA_MOMENT"] = "AHA_MOMENT";
  FeedbackType2["POSITIVE_EXPERIENCE"] = "POSITIVE_EXPERIENCE";
  FeedbackType2["SUGGESTION"] = "SUGGESTION";
  FeedbackType2["CONFUSION"] = "CONFUSION";
  FeedbackType2["GENERAL"] = "GENERAL";
  return FeedbackType2;
})(FeedbackType || {});
var HelpRequestStatus = /* @__PURE__ */ ((HelpRequestStatus2) => {
  HelpRequestStatus2["PENDING"] = "PENDING";
  HelpRequestStatus2["IN_PROGRESS"] = "IN_PROGRESS";
  HelpRequestStatus2["RESOLVED"] = "RESOLVED";
  return HelpRequestStatus2;
})(HelpRequestStatus || {});
var TriggerType = /* @__PURE__ */ ((TriggerType2) => {
  TriggerType2["ENGAGEMENT"] = "ENGAGEMENT";
  TriggerType2["CHECK_IN"] = "CHECK_IN";
  TriggerType2["QUIZ"] = "QUIZ";
  TriggerType2["ENCOURAGE"] = "ENCOURAGE";
  return TriggerType2;
})(TriggerType || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ALICE_BOOK_ID_STRING,
  ALICE_BOOK_ID_UUID,
  FeedbackType,
  HelpRequestStatus,
  TriggerType,
  asBookId,
  asChapterId,
  asConsultantActionId,
  asConsultantTriggerId,
  asDictionaryId,
  asFeedbackId,
  asHelpRequestId,
  asProfileId,
  asReadingProgressId,
  asReadingStatsId,
  asSectionId,
  asUserId,
  authClient,
  createSupabaseClient,
  dbClient,
  generateUuid,
  getBookStringId,
  getBookUuid,
  getSupabaseClient,
  initializeSupabase,
  isUuid,
  supabase,
  validateSupabaseConfig,
  validateUuid
});
//# sourceMappingURL=index.js.map