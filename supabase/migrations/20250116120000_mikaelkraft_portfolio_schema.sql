-- Location: supabase/migrations/20250116120000_mikaelkraft_portfolio_schema.sql
-- MikaelKraft Portfolio Database Schema with Authentication

-- 1. Types and Core Tables
CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.project_technology AS ENUM ('react', 'nodejs', 'python', 'php', 'javascript', 'css', 'html', 'blockchain', 'solidity', 'java', 'r', 'mongodb', 'postgresql', 'aws', 'docker');
CREATE TYPE public.user_role AS ENUM ('admin', 'visitor');

-- User profiles table (intermediary for auth relationships)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'admin'::public.user_role,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    featured_image TEXT,
    technologies public.project_technology[] DEFAULT '{}',
    github_url TEXT,
    live_url TEXT,
    status public.content_status DEFAULT 'draft'::public.content_status,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    author_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Blog posts table
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    featured_image TEXT,
    tags TEXT[] DEFAULT '{}',
    category TEXT,
    status public.content_status DEFAULT 'draft'::public.content_status,
    read_time INTEGER DEFAULT 5,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    meta_title TEXT,
    meta_description TEXT,
    author_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Hero slides table
CREATE TABLE public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    background_image TEXT,
    cta_text TEXT,
    cta_link TEXT,
    display_order INTEGER NOT NULL DEFAULT 1,
    duration INTEGER DEFAULT 5,
    status public.content_status DEFAULT 'published'::public.content_status,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Comments table (for blog posts - no auth required for visitors)
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT true,
    visitor_ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Likes table (for tracking likes on posts and comments)
CREATE TABLE public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    visitor_ip TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT likes_single_target CHECK (
        (blog_post_id IS NOT NULL AND comment_id IS NULL AND project_id IS NULL) OR
        (blog_post_id IS NULL AND comment_id IS NOT NULL AND project_id IS NULL) OR
        (blog_post_id IS NULL AND comment_id IS NULL AND project_id IS NOT NULL)
    ),
    UNIQUE(blog_post_id, visitor_ip),
    UNIQUE(comment_id, visitor_ip),
    UNIQUE(project_id, visitor_ip)
);

-- Site settings table
CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_title TEXT DEFAULT 'MikaelKraft Portfolio',
    site_tagline TEXT DEFAULT 'Neo-Cyberpunk portfolio Experience',
    site_description TEXT,
    contact_email TEXT,
    admin_email TEXT,
    enable_video BOOLEAN DEFAULT true,
    default_theme TEXT DEFAULT 'cyberpunk',
    default_font_size TEXT DEFAULT 'medium',
    logo_url TEXT,
    favicon_url TEXT,
    social_media JSONB DEFAULT '{}',
    seo_settings JSONB DEFAULT '{}',
    maintenance_mode BOOLEAN DEFAULT false,
    custom_css TEXT,
    custom_js TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_projects_author_id ON public.projects(author_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_featured ON public.projects(featured);
CREATE INDEX idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX idx_blog_posts_featured ON public.blog_posts(featured);
CREATE INDEX idx_hero_slides_order ON public.hero_slides(display_order);
CREATE INDEX idx_hero_slides_status ON public.hero_slides(status);
CREATE INDEX idx_comments_blog_post_id ON public.comments(blog_post_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_comment_id);
CREATE INDEX idx_likes_blog_post_id ON public.likes(blog_post_id);
CREATE INDEX idx_likes_comment_id ON public.likes(comment_id);
CREATE INDEX idx_likes_project_id ON public.likes(project_id);

-- 3. RLS Setup
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 4. Helper Functions for RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
)
$$;

CREATE OR REPLACE FUNCTION public.is_published_content(content_status public.content_status)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
SELECT content_status = 'published'::public.content_status
$$;

-- Function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'admin'::public.user_role)
  );  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update triggers for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hero_slides_updated_at BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. RLS Policies

-- User profiles: Admin can manage all, users can view their own
CREATE POLICY "admin_manage_all_profiles" ON public.user_profiles FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "users_view_own_profile" ON public.user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Projects: Admin can manage all, public can view published
CREATE POLICY "admin_manage_all_projects" ON public.projects FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "public_view_published_projects" ON public.projects FOR SELECT
TO public
USING (public.is_published_content(status));

-- Blog posts: Admin can manage all, public can view published
CREATE POLICY "admin_manage_all_posts" ON public.blog_posts FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "public_view_published_posts" ON public.blog_posts FOR SELECT
TO public
USING (public.is_published_content(status));

-- Hero slides: Admin can manage all, public can view published
CREATE POLICY "admin_manage_all_slides" ON public.hero_slides FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "public_view_published_slides" ON public.hero_slides FOR SELECT
TO public
USING (public.is_published_content(status));

-- Comments: Public can create and view, admin can manage all
CREATE POLICY "public_create_comments" ON public.comments FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "public_view_approved_comments" ON public.comments FOR SELECT
TO public
USING (is_approved = true);

CREATE POLICY "admin_manage_all_comments" ON public.comments FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Likes: Public can create and view
CREATE POLICY "public_manage_likes" ON public.likes FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Site settings: Admin can manage, public can view
CREATE POLICY "admin_manage_settings" ON public.site_settings FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "public_view_settings" ON public.site_settings FOR SELECT
TO public
USING (true);

-- 6. Functions for business logic

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(
    content_type TEXT,
    content_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    CASE content_type
        WHEN 'project' THEN
            UPDATE public.projects 
            SET view_count = view_count + 1 
            WHERE id = content_id;
        WHEN 'blog_post' THEN
            UPDATE public.blog_posts 
            SET view_count = view_count + 1 
            WHERE id = content_id;
        WHEN 'hero_slide' THEN
            UPDATE public.hero_slides 
            SET view_count = view_count + 1 
            WHERE id = content_id;
    END CASE;
END;
$$;

-- Function to toggle like
CREATE OR REPLACE FUNCTION public.toggle_like(
    content_type TEXT,
    content_id UUID,
    visitor_ip_addr TEXT,
    user_agent_str TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    like_exists BOOLEAN := false;
    column_name TEXT;
    table_name TEXT;
BEGIN
    -- Determine the column and table based on content type
    CASE content_type
        WHEN 'blog_post' THEN
            column_name := 'blog_post_id';
            table_name := 'blog_posts';
        WHEN 'comment' THEN
            column_name := 'comment_id';
            table_name := 'comments';
        WHEN 'project' THEN
            column_name := 'project_id';
            table_name := 'projects';
        ELSE
            RAISE EXCEPTION 'Invalid content type: %', content_type;
    END CASE;

    -- Check if like exists
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM public.likes WHERE %I = $1 AND visitor_ip = $2)', column_name)
    USING content_id, visitor_ip_addr
    INTO like_exists;

    IF like_exists THEN
        -- Remove like
        EXECUTE format('DELETE FROM public.likes WHERE %I = $1 AND visitor_ip = $2', column_name)
        USING content_id, visitor_ip_addr;
        
        -- Decrement count
        EXECUTE format('UPDATE public.%I SET like_count = like_count - 1 WHERE id = $1', table_name)
        USING content_id;
        
        RETURN false;
    ELSE
        -- Add like
        CASE content_type
            WHEN 'blog_post' THEN
                INSERT INTO public.likes (blog_post_id, visitor_ip, user_agent)
                VALUES (content_id, visitor_ip_addr, user_agent_str);
            WHEN 'comment' THEN
                INSERT INTO public.likes (comment_id, visitor_ip, user_agent)
                VALUES (content_id, visitor_ip_addr, user_agent_str);
            WHEN 'project' THEN
                INSERT INTO public.likes (project_id, visitor_ip, user_agent)
                VALUES (content_id, visitor_ip_addr, user_agent_str);
        END CASE;
        
        -- Increment count
        EXECUTE format('UPDATE public.%I SET like_count = like_count + 1 WHERE id = $1', table_name)
        USING content_id;
        
        RETURN true;
    END IF;
END;
$$;

-- Function to get blog post with comments
CREATE OR REPLACE FUNCTION public.get_blog_post_with_comments(post_slug TEXT)
RETURNS TABLE(
    post_id UUID,
    title TEXT,
    content TEXT,
    excerpt TEXT,
    featured_image TEXT,
    tags TEXT[],
    category TEXT,
    read_time INTEGER,
    view_count INTEGER,
    like_count INTEGER,
    comment_count INTEGER,
    author_name TEXT,
    published_at TIMESTAMPTZ,
    comments JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.id,
        bp.title,
        bp.content,
        bp.excerpt,
        bp.featured_image,
        bp.tags,
        bp.category,
        bp.read_time,
        bp.view_count,
        bp.like_count,
        bp.comment_count,
        up.full_name,
        bp.published_at,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', c.id,
                        'content', c.content,
                        'author_name', c.author_name,
                        'like_count', c.like_count,
                        'created_at', c.created_at,
                        'replies', (
                            SELECT COALESCE(jsonb_agg(
                                jsonb_build_object(
                                    'id', cr.id,
                                    'content', cr.content,
                                    'author_name', cr.author_name,
                                    'like_count', cr.like_count,
                                    'created_at', cr.created_at
                                )
                                ORDER BY cr.created_at ASC
                            ), '[]'::jsonb)
                            FROM public.comments cr
                            WHERE cr.parent_comment_id = c.id AND cr.is_approved = true
                        )
                    )
                    ORDER BY c.created_at DESC
                )
                FROM public.comments c
                WHERE c.blog_post_id = bp.id AND c.parent_comment_id IS NULL AND c.is_approved = true
            ), '[]'::jsonb
        ) as comments
    FROM public.blog_posts bp
    LEFT JOIN public.user_profiles up ON bp.author_id = up.id
    WHERE bp.slug = post_slug AND bp.status = 'published'::public.content_status;
END;
$$;

-- 7. Insert default admin user and initial data
DO $$
DECLARE
    admin_auth_id UUID := gen_random_uuid();
    project1_id UUID := gen_random_uuid();
    project2_id UUID := gen_random_uuid();
    project3_id UUID := gen_random_uuid();
    blog1_id UUID := gen_random_uuid();
    blog2_id UUID := gen_random_uuid();
    blog3_id UUID := gen_random_uuid();
    slide1_id UUID := gen_random_uuid();
    slide2_id UUID := gen_random_uuid();
    slide3_id UUID := gen_random_uuid();
BEGIN
    -- Create admin auth user
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES (
        admin_auth_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'mikewillkraft@gmail.com', crypt('MikaelKraft2025!', gen_salt('bf', 10)), now(), now(), now(),
        '{"full_name": "Mikael Kraft", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
        false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    );

    -- Insert sample projects
    INSERT INTO public.projects (id, title, description, content, featured_image, technologies, github_url, live_url, status, view_count, like_count, featured, author_id) VALUES
        (project1_id, 'EverythingOutfit E-commerce Platform', 'Full-stack e-commerce solution with React, Node.js, and advanced payment integration featuring real-time inventory management and AI-powered recommendations.', 
         'A comprehensive e-commerce platform built with modern technologies including React for the frontend, Node.js with Express for the backend, and MongoDB for data storage. Features include real-time inventory management, AI-powered product recommendations, secure payment processing with Stripe, and advanced analytics dashboard.',
         'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
         ARRAY['react', 'nodejs', 'mongodb']::public.project_technology[],
         'https://github.com/mikaelkraft/ecommerce-platform',
         'https://everythingoutfit.vercel.app',
         'published'::public.content_status, 1250, 89, true, admin_auth_id),
        
        (project2_id, 'Neural Network Visualization Tool', 'Interactive web application for visualizing and understanding neural network architectures with real-time training visualization.',
         'An advanced neural network visualization tool that helps developers and researchers understand complex ML architectures. Built with Python backend using TensorFlow and FastAPI, React frontend with D3.js for interactive visualizations, and WebSocket connections for real-time training progress.',
         'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
         ARRAY['python', 'react', 'javascript']::public.project_technology[],
         'https://github.com/mikaelkraft/neural-viz',
         'https://neural-viz.vercel.app',
         'published'::public.content_status, 980, 67, true, admin_auth_id),
        
        (project3_id, 'Blockchain Analytics Dashboard', 'Real-time cryptocurrency and blockchain data analysis platform with advanced DeFi tracking capabilities.',
         'A comprehensive blockchain analytics platform providing real-time insights into cryptocurrency markets, DeFi protocols, and NFT trends. Features include portfolio tracking, yield farming optimization, smart contract interaction monitoring, and customizable alerting systems.',
         'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop',
         ARRAY['react', 'blockchain', 'solidity', 'nodejs']::public.project_technology[],
         'https://github.com/mikaelkraft/metachains',
         'https://metachains.vercel.app',
         'published'::public.content_status, 756, 45, false, admin_auth_id);

    -- Insert sample blog posts
    INSERT INTO public.blog_posts (id, title, slug, excerpt, content, featured_image, tags, category, status, read_time, view_count, like_count, comment_count, featured, author_id, published_at) VALUES
        (blog1_id, 'Building Scalable React Applications with Modern Architecture', 'building-scalable-react-applications-modern-architecture',
         'Explore advanced patterns and best practices for creating maintainable React applications that can grow with your team and requirements.',
         'In today''s fast-paced development environment, building scalable React applications is more crucial than ever. This comprehensive guide will walk you through the essential patterns and practices that will help you create applications that can grow with your needs.\n\n## Component Architecture\n\nThe foundation of any scalable React application lies in its component architecture. By following the principles of single responsibility and composition, we can create components that are both reusable and maintainable.\n\n### Key Principles:\n\n1. **Single Responsibility**: Each component should have one clear purpose\n2. **Composition over Inheritance**: Build complex UIs by combining simple components\n3. **Props Interface Design**: Create clear and consistent APIs for your components\n\n## State Management Strategies\n\nAs your application grows, managing state becomes increasingly complex. Consider these approaches:\n\n- **Local State**: Use useState for component-specific data\n- **Context API**: Share state across component trees\n- **External Libraries**: Redux, Zustand, or Jotai for complex state logic\n\n## Performance Optimization\n\nOptimizing performance is crucial for user experience:\n\n- Implement React.memo for expensive components\n- Use useMemo and useCallback judiciously\n- Consider code splitting with React.lazy\n- Optimize bundle size with tree shaking\n\n## Testing Strategy\n\nA robust testing strategy ensures your application remains reliable:\n\n- Unit tests for individual components\n- Integration tests for component interactions\n- End-to-end tests for critical user flows\n\nBy following these principles and patterns, you will be well-equipped to build React applications that can scale with your growing requirements while maintaining code quality and developer productivity.',
         'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
         ARRAY['react', 'architecture', 'scalability', 'best-practices'],
         'React', 'published'::public.content_status, 8, 2340, 156, 12, true, admin_auth_id, '2024-01-15T10:00:00Z'),
        
        (blog2_id, 'Mastering Node.js Performance: From Basics to Advanced Optimization', 'mastering-nodejs-performance-optimization',
         'Deep dive into Node.js performance optimization techniques, from basic profiling to advanced memory management and clustering strategies.',
         'Node.js has revolutionized server-side JavaScript development, but with great power comes the responsibility of writing performant code. This guide covers everything you need to know about optimizing Node.js applications.\n\n## Understanding the Event Loop\n\nThe event loop is the heart of Node.js performance. Understanding how it works is crucial for writing efficient applications:\n\n- **Call Stack**: Synchronous operations\n- **Callback Queue**: Asynchronous callbacks\n- **Microtask Queue**: Promises and process.nextTick\n\n## Profiling and Monitoring\n\nBefore optimizing, you need to identify bottlenecks:\n\n### Built-in Profiling Tools:\n- Node.js built-in profiler\n- Chrome DevTools integration\n- Performance hooks API\n\n### Third-party Solutions:\n- New Relic\n- DataDog\n- AppDynamics\n\n## Memory Management\n\nMemory leaks can kill Node.js applications:\n\n1. **Identify Memory Leaks**: Use heap snapshots and memory profiling\n2. **Common Causes**: Event listeners, closures, global variables\n3. **Prevention Strategies**: Proper cleanup, weak references, streaming\n\n## Clustering and Load Balancing\n\nScale your Node.js applications horizontally:\n\n- Use the cluster module for CPU-intensive tasks\n- Implement proper load balancing strategies\n- Consider PM2 for production deployments\n\n## Conclusion\n\nPerformance optimization is an ongoing process. Start with profiling, identify bottlenecks, and apply targeted optimizations.',
         'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop',
         ARRAY['nodejs', 'performance', 'optimization', 'backend'],
         'Node.js', 'published'::public.content_status, 12, 1890, 98, 8, true, admin_auth_id, '2024-01-12T14:30:00Z'),
        
        (blog3_id, 'The Future of Web Development: Emerging Technologies and Trends', 'future-web-development-emerging-technologies-trends',
         'Explore the cutting-edge technologies shaping the future of web development, from WebAssembly to AI-powered development tools.',
         'The web development landscape is evolving at an unprecedented pace. New technologies, frameworks, and paradigms are constantly emerging, reshaping how we build and interact with web applications.\n\n## WebAssembly: Beyond JavaScript\n\nWebAssembly (WASM) is revolutionizing web performance:\n\n- **Near-native Performance**: Run code at near-native speed in browsers\n- **Language Agnostic**: Write in C++, Rust, Go, and more\n- **Use Cases**: Gaming, image processing, cryptography\n\n## AI-Powered Development\n\nArtificial Intelligence is transforming how we write code:\n\n### Code Generation:\n- GitHub Copilot\n- TabNine\n- Amazon CodeWhisperer\n\n### Automated Testing:\n- AI-generated test cases\n- Visual regression testing\n- Intelligent bug detection\n\n## Edge Computing and CDNs\n\nBringing computation closer to users:\n\n- **Edge Functions**: Run code at CDN edge locations\n- **Reduced Latency**: Faster response times globally\n- **Popular Platforms**: Cloudflare Workers, Vercel Edge Functions\n\nThe future of web development is exciting and full of possibilities. While it is impossible to predict exactly what will dominate, staying curious and continuously learning will help you navigate this evolving landscape.',
         'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
         ARRAY['webdev', 'future', 'trends', 'innovation'],
         'Technology', 'published'::public.content_status, 15, 2100, 67, 23, false, admin_auth_id, '2024-01-10T09:15:00Z');

    -- Insert sample hero slides
    INSERT INTO public.hero_slides (id, title, subtitle, background_image, cta_text, cta_link, display_order, duration, status, view_count) VALUES
        (slide1_id, 'Welcome to CyberKraft', 'Innovative solutions for the digital future', 
         'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=600&fit=crop', 
         'Explore Projects', '/projects-portfolio-grid', 1, 5, 'published'::public.content_status, 5600),
        
        (slide2_id, 'Cutting-Edge Technology', 'Building tomorrow''s applications today', 
         'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop', 
         'View Blog', '/blog-content-hub', 2, 5, 'published'::public.content_status, 4200),
        
        (slide3_id, 'Let''s Collaborate', 'Ready to bring your ideas to life', 
         'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop', 
         'Contact Me', '/contact', 3, 5, 'published'::public.content_status, 1800);

    -- Insert sample comments
    INSERT INTO public.comments (blog_post_id, author_name, author_email, content, like_count, visitor_ip) VALUES
        (blog1_id, 'Sarah Developer', 'sarah@example.com', 'Excellent article! The component architecture section really helped me understand how to structure larger React applications.', 15, '192.168.1.100'),
        (blog1_id, 'Alex Thompson', 'alex@example.com', 'Great insights on state management. I have been struggling with choosing between Context and Redux, this clarified a lot.', 8, '192.168.1.101'),
        (blog2_id, 'Mike Backend', 'mike@example.com', 'The memory management section is gold! Helped me identify several memory leaks in our production app.', 12, '192.168.1.102'),
        (blog2_id, 'Lisa Performance', 'lisa@example.com', 'Love the profiling techniques. The Chrome DevTools integration tip saved me hours of debugging.', 6, '192.168.1.103'),
        (blog3_id, 'Future Dev', 'future@example.com', 'WebAssembly really is the future! Already experimenting with Rust for performance-critical parts.', 9, '192.168.1.104'),
        (blog3_id, 'AI Enthusiast', 'ai@example.com', 'The AI development tools section is fascinating. GitHub Copilot has already changed how I code.', 7, '192.168.1.105');

    -- Insert site settings
    INSERT INTO public.site_settings (site_title, site_tagline, site_description, contact_email, admin_email, social_media, seo_settings) VALUES
        ('CyberKraft Portfolio', 'Neo-Cyberpunk Experience', 
         'A futuristic portfolio showcasing cutting-edge development work and innovative solutions for the digital future.',
         'contact@cyberkraft.dev', 'admin@cyberkraft.dev',
         '{"twitter": "mikael_kraft", "linkedin": "in/mikael-kraft", "github": "mikaelkraft", "email": "contact@cyberkraft.dev"}'::jsonb,
         '{"keywords": "portfolio, developer, cyberpunk, react, javascript, web development", "ogImage": "https://cyberkraft.dev/og-image.jpg"}'::jsonb);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;

-- Create cleanup function for development
CREATE OR REPLACE FUNCTION public.cleanup_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user_ids_to_delete UUID[];
BEGIN
    -- Get auth user IDs first
    SELECT ARRAY_AGG(id) INTO auth_user_ids_to_delete
    FROM auth.users
    WHERE email LIKE '%@cyberkraft.dev' OR email LIKE '%@example.com';

    -- Delete in dependency order (children first, then auth.users last)
    DELETE FROM public.likes WHERE blog_post_id IN (SELECT id FROM public.blog_posts WHERE author_id = ANY(auth_user_ids_to_delete));
    DELETE FROM public.likes WHERE comment_id IN (SELECT id FROM public.comments WHERE blog_post_id IN (SELECT id FROM public.blog_posts WHERE author_id = ANY(auth_user_ids_to_delete)));
    DELETE FROM public.likes WHERE project_id IN (SELECT id FROM public.projects WHERE author_id = ANY(auth_user_ids_to_delete));
    DELETE FROM public.comments WHERE blog_post_id IN (SELECT id FROM public.blog_posts WHERE author_id = ANY(auth_user_ids_to_delete));
    DELETE FROM public.blog_posts WHERE author_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.projects WHERE author_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.hero_slides;
    DELETE FROM public.site_settings;
    DELETE FROM public.user_profiles WHERE id = ANY(auth_user_ids_to_delete);

    -- Delete auth.users last (after all references are removed)
    DELETE FROM auth.users WHERE id = ANY(auth_user_ids_to_delete);
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents deletion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;
