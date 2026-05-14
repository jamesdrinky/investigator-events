-- delete_user_data: atomic per-user cleanup invoked from /api/delete-account.
-- Apple Guideline 5.1.1(v) requires that account deletion actually delete the
-- user's data, not just deactivate the account. The API route calls this RPC
-- with SECURITY DEFINER so it runs as the owner and bypasses RLS; the route's
-- own auth check ensures only the user themselves (via service_role) can
-- trigger it for their own id.
--
-- After the RPC runs, the API route calls auth.admin.deleteUser(target_user_id)
-- to remove the auth.users row itself.

CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Order matters only where FKs cascade through to other tables we also
  -- explicitly delete from. Each statement uses IF EXISTS-style guards by
  -- catching undefined_table so adding/removing tables in the future is safe.
  BEGIN DELETE FROM post_likes WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM post_comments WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM posts WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM event_attendees WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM saved_events WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM event_reviews WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM event_photos WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM work_experience WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM user_associations WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM profile_sections WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM member_verifications WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM association_admins WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM lfg_responses WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM lfg_posts WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM notifications WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM reports WHERE reporter_id = target_user_id OR reported_user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM clash_checks WHERE user_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM followers WHERE follower_id = target_user_id OR followed_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM connections WHERE requester_id = target_user_id OR addressee_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM messages WHERE sender_id = target_user_id OR receiver_id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM profiles WHERE id = target_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_data(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_data(uuid) TO service_role;
