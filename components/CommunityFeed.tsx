'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Send, ImagePlus, LinkIcon, X, Trash2, Pin, Share2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';
import { WelcomeBanner } from '@/components/WelcomeBanner';

type Post = {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  image_url: string | null;
  link_url: string | null;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  full_name: string | null;
  avatar_url: string | null;
  specialisation: string | null;
  country: string | null;
  username: string | null;
};

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  full_name: string | null;
  avatar_url: string | null;
};

export function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userUsername, setUserUsername] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Compose state
  const [showCompose, setShowCompose] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postLink, setPostLink] = useState('');
  const [posting, setPosting] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);

  // Comments
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url, username').eq('id', uid).single();
        setUserAvatar(profile?.avatar_url ?? data.user?.user_metadata?.avatar_url ?? null);
        setUserName(profile?.full_name ?? data.user?.user_metadata?.full_name ?? null);
        setUserUsername(profile?.username ?? null);

        // Get liked posts
        const { data: likes } = await supabase.from('post_likes').select('post_id').eq('user_id', uid);
        setLikedPosts(new Set((likes ?? []).map((l) => l.post_id)));
      }
    });

    // Fetch posts with profile join — pinned first, then by date
    supabase
      .from('posts')
      .select('id, user_id, title, content, image_url, link_url, likes_count, comments_count, is_pinned, created_at, profiles:user_id(full_name, avatar_url, specialisation, country, username)')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        const rows = (data ?? []).map((r: any) => ({
          id: r.id, user_id: r.user_id, title: r.title ?? null, content: r.content, image_url: r.image_url,
          link_url: r.link_url, likes_count: r.likes_count ?? 0, comments_count: r.comments_count ?? 0,
          is_pinned: r.is_pinned ?? false, created_at: r.created_at,
          full_name: r.profiles?.full_name ?? null, avatar_url: r.profiles?.avatar_url ?? null,
          specialisation: r.profiles?.specialisation ?? null, country: r.profiles?.country ?? null, username: r.profiles?.username ?? null,
        }));
        setPosts(rows);
        setLoading(false);
      });
  }, []);

  const handlePost = async () => {
    if (!userId || !postText.trim()) return;

    // Basic content filter — block slurs/hate speech
    const blocked = /\b(nigger|nigga|faggot|retard|kike|spic|chink|wetback|coon|darkie|gook|tranny)\b/i;
    if (blocked.test(postText)) {
      alert('Your post contains language that violates our community guidelines. Please edit and try again.');
      return;
    }

    setPosting(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        title: postTitle.trim() || null,
        content: postText.trim(),
        image_url: postImage,
        link_url: postLink.trim() || null,
      } as any)
      .select('id, user_id, title, content, image_url, link_url, likes_count, comments_count, is_pinned, created_at')
      .single();

    if (data) {
      const d = data as any;
      setPosts((prev) => [{
        id: d.id, user_id: d.user_id, title: d.title ?? null, content: d.content,
        image_url: d.image_url, link_url: d.link_url,
        likes_count: d.likes_count ?? 0, comments_count: d.comments_count ?? 0,
        is_pinned: false, created_at: d.created_at,
        full_name: userName, avatar_url: userAvatar, specialisation: null, country: null, username: userUsername,
      }, ...prev]);
      setPostTitle('');
      setPostText('');
      setPostImage(null);
      setPostLink('');
      setShowCompose(false);
      setShowLinkInput(false);
    }
    setPosting(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    const supabase = createSupabaseBrowserClient();
    const ext = file.name.split('.').pop() ?? 'jpg';
    const filePath = `posts/${userId}/${Date.now()}.${ext}`;
    await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setPostImage(urlData.publicUrl);
  };

  const toggleLike = async (postId: string) => {
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    const isLiked = likedPosts.has(postId);

    if (isLiked) {
      await supabase.from('post_likes').delete().eq('user_id', userId).eq('post_id', postId);
      setLikedPosts((prev) => { const next = new Set(prev); next.delete(postId); return next; });
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: Math.max(0, p.likes_count - 1) } : p));
    } else {
      const { error: likeErr } = await supabase.from('post_likes').insert({ user_id: userId, post_id: postId });
      if (!likeErr) {
        setLikedPosts((prev) => new Set(prev).add(postId));
        setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));

        const post = posts.find((p) => p.id === postId);
        if (post && post.user_id !== userId) {
          const { data: myProfile } = await supabase.from('profiles').select('full_name, username').eq('id', userId).single();
          fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: post.user_id,
              actorId: userId,
              type: 'post_like',
              title: `${myProfile?.full_name ?? 'Someone'} liked your post`,
              link: '/people?tab=feed',
            }),
          }).catch(() => {});
        }
      }
    }
  };

  const loadComments = async (postId: string) => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('post_comments')
      .select('id, user_id, content, created_at, profiles:user_id(full_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .limit(20);

    const rows = (data ?? []).map((r: any) => ({
      id: r.id, user_id: r.user_id, content: r.content, created_at: r.created_at,
      full_name: r.profiles?.full_name ?? null, avatar_url: r.profiles?.avatar_url ?? null,
    }));
    setComments((prev) => ({ ...prev, [postId]: rows }));
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) { next.delete(postId); } else { next.add(postId); loadComments(postId); }
      return next;
    });
  };

  const submitComment = async (postId: string) => {
    if (!userId || !commentText[postId]?.trim()) return;
    const blocked = /\b(nigger|nigga|faggot|retard|kike|spic|chink|wetback|coon|darkie|gook|tranny)\b/i;
    if (blocked.test(commentText[postId])) {
      alert('Your comment contains language that violates our community guidelines.');
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('post_comments')
      .insert({ user_id: userId, post_id: postId, content: commentText[postId].trim() })
      .select('id, user_id, content, created_at')
      .single();

    if (data) {
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), { ...data, full_name: userName, avatar_url: userAvatar }],
      }));
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
      setCommentText((prev) => ({ ...prev, [postId]: '' }));

      // Notify post author
      const post = posts.find((p) => p.id === postId);
      if (post && post.user_id !== userId) {
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: post.user_id,
            actorId: userId,
            type: 'post_comment',
            title: `${userName ?? 'Someone'} commented on your post`,
            link: '/people?tab=feed',
          }),
        }).catch(() => {});
      }
    }
  };

  const deletePost = async (postId: string) => {
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from('posts').delete().eq('id', postId).eq('user_id', userId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const timeAgo = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Compose box */}
      {userId && (
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex gap-3">
            <UserAvatar src={userAvatar} name={userName} size={40} />
            {!showCompose ? (
              <button
                type="button"
                onClick={() => setShowCompose(true)}
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-left text-sm text-slate-400 transition hover:bg-slate-100"
              >
                Share something with the community...
              </button>
            ) : (
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full border-0 bg-transparent text-base font-bold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="Post title (optional)"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  autoFocus
                />
                <textarea
                  className="mt-1 w-full resize-none border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  rows={3}
                  placeholder="Share news, advice, event experiences..."
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />
                {postImage && (
                  <div className="relative mt-2 inline-block">
                    <Image src={postImage} alt="" width={200} height={120} className="rounded-lg object-cover" />
                    <button type="button" onClick={() => setPostImage(null)} className="absolute -right-2 -top-2 rounded-full bg-slate-800 p-0.5 text-white"><X className="h-3 w-3" /></button>
                  </div>
                )}
                {showLinkInput && (
                  <input className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none" placeholder="https://..." value={postLink} onChange={(e) => setPostLink(e.target.value)} />
                )}
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex gap-1">
                    <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-blue-600">
                      <ImagePlus className="h-4 w-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <button type="button" onClick={() => setShowLinkInput(!showLinkInput)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-blue-600">
                      <LinkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setShowCompose(false); setPostTitle(''); setPostText(''); setPostImage(null); setPostLink(''); }} className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600">Cancel</button>
                    <button type="button" onClick={handlePost} disabled={posting || !postText.trim()} className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">
                      {posting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
              <div className="flex gap-3"><div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" /><div className="flex-1 space-y-2"><div className="h-4 w-32 animate-pulse rounded bg-slate-100" /><div className="h-3 w-20 animate-pulse rounded bg-slate-100" /></div></div>
              <div className="mt-4 h-16 animate-pulse rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center">
          <p className="text-sm text-slate-400">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {posts.map((post) => {
            const isLiked = likedPosts.has(post.id);
            const isExpanded = expandedComments.has(post.id);
            const postComments = comments[post.id] ?? [];

            return (
              <div key={post.id} className={`rounded-2xl border bg-white shadow-sm ${post.is_pinned ? 'border-blue-200/80' : 'border-slate-200/60'}`}>
                {/* Pinned badge */}
                {post.is_pinned && (
                  <div className="flex items-center gap-1.5 border-b border-blue-100 bg-blue-50/50 px-5 py-2 text-[11px] font-semibold text-blue-600">
                    <Pin className="h-3 w-3" /> Pinned
                  </div>
                )}

                {/* Post header */}
                <div className="flex items-start justify-between px-5 pt-4">
                  <a href={post.username ? `/profile/${post.username}` : '#'} className="flex gap-3 group">
                    <UserAvatar src={post.avatar_url} name={post.full_name} size={44} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 group-hover:underline">{post.full_name ?? 'Investigator'}</p>
                      <p className="text-xs text-slate-400">
                        {post.specialisation && <span className="text-slate-500">{post.specialisation}</span>}
                        {post.specialisation && ' · '}{timeAgo(post.created_at)}
                      </p>
                    </div>
                  </a>
                  {post.user_id === userId && (
                    <button type="button" onClick={() => deletePost(post.id)} className="rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Title + Content */}
                <div className="px-5 pt-3">
                  {post.title && (
                    <h3 className="mb-1 text-base font-bold text-slate-900">{post.title}</h3>
                  )}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{post.content}</p>
                </div>

                {/* Image */}
                {/* Welcome banner for pinned welcome post, or regular image */}
                {post.is_pinned && post.title?.toLowerCase().includes('welcome') && !post.image_url ? (
                  <div className="mt-3 px-5">
                    <WelcomeBanner />
                  </div>
                ) : post.image_url ? (
                  <div className="mt-3 px-5">
                    <Image src={post.image_url} alt="" width={600} height={400} className="w-full rounded-xl object-cover" />
                  </div>
                ) : null}

                {/* Link */}
                {post.link_url && /^https?:\/\//i.test(post.link_url) && (
                  <div className="mx-5 mt-3">
                    <a href={post.link_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-blue-600 transition hover:bg-slate-100">
                      <LinkIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{post.link_url}</span>
                    </a>
                  </div>
                )}

                {/* Stats */}
                {(post.likes_count > 0 || post.comments_count > 0) && (
                  <div className="mx-5 mt-3 flex items-center gap-4 text-xs text-slate-400">
                    {post.likes_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 fill-blue-500 text-blue-500" />
                        {post.likes_count}
                      </span>
                    )}
                    {post.comments_count > 0 && (
                      <button type="button" onClick={() => toggleComments(post.id)} className="hover:text-slate-600">
                        {post.comments_count} comment{post.comments_count !== 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mx-5 mt-3 flex border-t border-slate-100 py-1.5">
                  <button
                    type="button"
                    onClick={() => toggleLike(post.id)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${
                      isLiked ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-blue-600' : ''}`} /> Like
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleComments(post.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
                  >
                    <MessageCircle className="h-4 w-4" /> Comment
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const url = `${window.location.origin}/people?post=${post.id}`;
                      const text = `${post.full_name ?? 'Someone'} on Investigator Events: "${post.content.slice(0, 100)}${post.content.length > 100 ? '...' : ''}"`;
                      if (navigator.share) {
                        await navigator.share({ title: 'Investigator Events', text, url });
                      } else {
                        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
                      }
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                </div>

                {/* Comments section */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 pb-4 pt-3">
                    {postComments.map((c) => (
                      <div key={c.id} className="mb-2 flex gap-2.5">
                        <UserAvatar src={c.avatar_url} name={c.full_name} size={28} />
                        <div className="rounded-xl bg-slate-50 px-3 py-2">
                          <p className="text-xs font-semibold text-slate-800">{c.full_name ?? 'Investigator'}</p>
                          <p className="text-sm text-slate-600">{c.content}</p>
                          <p className="mt-0.5 text-[10px] text-slate-400">{timeAgo(c.created_at)}</p>
                        </div>
                      </div>
                    ))}

                    {/* Comment input */}
                    {userId && (
                      <div className="mt-2 flex gap-2">
                        <UserAvatar src={userAvatar} name={userName} size={28} />
                        <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3">
                          <input
                            type="text"
                            value={commentText[post.id] ?? ''}
                            onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') submitComment(post.id); }}
                            placeholder="Write a comment..."
                            className="flex-1 border-0 bg-transparent py-1.5 text-sm outline-none"
                          />
                          <button type="button" onClick={() => submitComment(post.id)} disabled={!commentText[post.id]?.trim()} className="text-blue-500 disabled:opacity-30">
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
