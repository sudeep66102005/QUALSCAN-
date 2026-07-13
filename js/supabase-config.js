/* ============================================================
   QUALSCAN — Supabase configuration + lead submission helper
   ------------------------------------------------------------
   The values below are the project URL and the PUBLIC
   "publishable" key. These are safe to expose in the browser:
   the database uses Row Level Security so this key can only
   INSERT leads, never read or modify them.

   Table + policy setup lives in /supabase/leads.sql — run that
   once in the Supabase SQL Editor before using the forms.
   ============================================================ */
(function () {
  "use strict";

  var SUPABASE_URL = "https://pwlqrnsqzibgztwxfqdn.supabase.co";
  var SUPABASE_KEY = "sb_publishable_Ck9NaRo7Srfw2HKIe256aQ_cmECaDEP";

  /**
   * Insert a single lead row into the `leads` table.
   * @param {Object} lead - column/value pairs matching the leads table.
   * @returns {Promise<boolean>} resolves true on success, rejects on error.
   */
  function submitLead(lead) {
    return fetch(SUPABASE_URL + "/rest/v1/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(lead)
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (text) {
          throw new Error("Supabase insert failed (" + res.status + "): " + text);
        });
      }
      return true;
    });
  }

  window.QualscanLeads = { submit: submitLead };
})();
