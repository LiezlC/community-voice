import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

let reporterSession: Promise<string> | null = null

export function ensureReporterSession(): Promise<string> {
  if (reporterSession) return reporterSession
  reporterSession = (async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    if (sessionData.session) return sessionData.session.user.id
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) throw error
    if (!data.user) throw new Error('Unable to create a private reporting session')
    return data.user.id
  })().finally(() => { reporterSession = null })
  return reporterSession
}
