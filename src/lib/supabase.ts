import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('invoices').select('count', { count: 'exact' });
    if (error) throw error;
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }
};

// Debug function to log the actual query results
export const debugSearch = async (searchQuery: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { data: [], error: 'No active session' };

    // Get all invoices with clients for debugging
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        client_id,
        clients (id, name)
      `)
      .eq('user_id', session.user.id)
      .limit(5);

    if (error) throw error;
    console.log('Debug search results:', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('Debug search error:', error);
    return { data: [], error: error.message };
  }
};

// Debug function to analyze database structure
export const analyzeDatabaseStructure = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { data: null, error: 'No active session' };

    // Get table definitions
    const tables = ['invoices', 'clients', 'invoice_items'];
    const results: any = {};

    for (const table of tables) {
      // Get a sample record with all fields
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`Error getting sample from ${table}:`, error);
        results[table] = { error: error.message };
      } else {
        results[table] = {
          sample: data?.[0] || null,
          fields: data?.[0] ? Object.keys(data[0]) : []
        };
      }
    }

    // Try to understand the relationship
    try {
      const { data: relationData, error: relationError } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          client_id,
          clients(id, name)
        `)
        .limit(1);

      results.relationship = {
        data: relationData,
        error: relationError?.message
      };
    } catch (err: any) {
      results.relationship = { error: err.message };
    }

    console.log('Database analysis:', results);
    return { data: results, error: null };
  } catch (error: any) {
    console.error('Error analyzing database:', error);
    return { data: null, error: error.message };
  }
};

// Simplified search that directly joins clients and invoices
export const searchInvoices = async (
  searchQuery: string = '', 
  page: number = 1, 
  pageSize: number = 10,
  filters?: {
    startDate?: Date | null;
    endDate?: Date | null;
    status?: string;
    paymentType?: string;
  }
) => {
  try {
    console.log('Searching with query:', searchQuery);
    
    // Calculate range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Get session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { data: [], count: 0, error: 'No active session' };
    
    // STEP 1: First, try to analyze the database structure
    await analyzeDatabaseStructure();
    
    // STEP 2: First, get all client IDs that match our name search
    let clientIds: string[] = [];
    
    if (searchQuery && !isNaN(Number(searchQuery))) {
      // If it's a number, we'll just search invoices directly
      // No need to get client IDs
    } else if (searchQuery) {
      // If it's not a number, search clients by name
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .ilike('name', `%${searchQuery}%`)
        .eq('user_id', session.user.id);
      
      if (clientsError) {
        console.error('Error searching clients:', clientsError);
        // Continue without client IDs
      } else if (clientsData && clientsData.length > 0) {
        clientIds = clientsData.map(client => client.id);
        console.log('Found matching client IDs:', clientIds);
      }
    }
    
    // STEP 3: Now build our invoice query with different approaches
    
    // Try the first approach: clients with Foreign Key
    try {
      // Build the query
      let invoiceQuery = supabase
        .from('invoices')
        .select(`
          *,
          clients(*),
          invoice_items(*)
        `, { count: 'exact' })
        .eq('user_id', session.user.id);
  
      // Apply search filters
      if (searchQuery) {
        if (!isNaN(Number(searchQuery))) {
          // If it's a number, search by invoice number
          invoiceQuery = invoiceQuery.ilike('invoice_number', `%${searchQuery}%`);
        } else if (clientIds.length > 0) {
          // If we found matching clients, search by client IDs
          invoiceQuery = invoiceQuery.in('client_id', clientIds);
        } else if (searchQuery) {
          // If no matching clients but we have a search query, still try invoice numbers
          invoiceQuery = invoiceQuery.ilike('invoice_number', `%${searchQuery}%`);
        }
      }
  
      // Apply other filters
      if (filters?.startDate) {
        invoiceQuery = invoiceQuery.gte('date', filters.startDate.toISOString().split('T')[0]);
      }
      
      if (filters?.endDate) {
        invoiceQuery = invoiceQuery.lte('date', filters.endDate.toISOString().split('T')[0]);
      }
      
      if (filters?.status && filters.status !== 'All') {
        invoiceQuery = invoiceQuery.eq('status', filters.status);
      }
      
      if (filters?.paymentType && filters.paymentType !== 'All') {
        invoiceQuery = invoiceQuery.eq('payment_type', filters.paymentType);
      }
      
      // Execute the query with pagination
      const { data, error, count } = await invoiceQuery
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) {
        throw error;
      }
      
      console.log('Search returned', data?.length, 'results');
      if (data && data.length > 0) {
        console.log('First result:', {
          invoice_number: data[0].invoice_number,
          client: data[0].clients,
          items: data[0].invoice_items && data[0].invoice_items.length
        });
      }
      
      return { 
        data: data || [], 
        count: count || 0, 
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page,
        error: null 
      };
    } catch (primaryError) {
      console.error('Primary query approach failed:', primaryError);
      console.log('Trying fallback approach...');
      
      // Fallback approach: Separate queries
      // Get invoices first
      let invoiceQuery = supabase
        .from('invoices')
        .select('*', { count: 'exact' })
        .eq('user_id', session.user.id);
      
      // Apply search filters
      if (searchQuery) {
        if (!isNaN(Number(searchQuery))) {
          // If it's a number, search by invoice number
          invoiceQuery = invoiceQuery.ilike('invoice_number', `%${searchQuery}%`);
        } else if (clientIds.length > 0) {
          // If we found matching clients, search by client IDs
          invoiceQuery = invoiceQuery.in('client_id', clientIds);
        } else if (searchQuery) {
          // If no matching clients but we have a search query, still try invoice numbers
          invoiceQuery = invoiceQuery.ilike('invoice_number', `%${searchQuery}%`);
        }
      }
      
      // Apply other filters
      if (filters?.startDate) {
        invoiceQuery = invoiceQuery.gte('date', filters.startDate.toISOString().split('T')[0]);
      }
      
      if (filters?.endDate) {
        invoiceQuery = invoiceQuery.lte('date', filters.endDate.toISOString().split('T')[0]);
      }
      
      if (filters?.status && filters.status !== 'All') {
        invoiceQuery = invoiceQuery.eq('status', filters.status);
      }
      
      if (filters?.paymentType && filters.paymentType !== 'All') {
        invoiceQuery = invoiceQuery.eq('payment_type', filters.paymentType);
      }
      
      // Execute the query with pagination
      const { data: invoicesData, error: invoicesError, count } = await invoiceQuery
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (invoicesError) throw invoicesError;
      
      // No invoices found
      if (!invoicesData || invoicesData.length === 0) {
        return { 
          data: [], 
          count: 0, 
          totalPages: 0,
          currentPage: page,
          error: null 
        };
      }
      
      // Now fetch client data for each invoice
      const invoiceClientIds = invoicesData
        .map(invoice => invoice.client_id)
        .filter(id => id); // Remove any null/undefined
      
      let clientsData: any[] = [];
      
      if (invoiceClientIds.length > 0) {
        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .in('id', invoiceClientIds);
        
        if (clientsError) {
          console.error('Error fetching client data:', clientsError);
        } else {
          clientsData = clients || [];
        }
      }
      
      // Now fetch invoice items
      const invoiceIds = invoicesData.map(invoice => invoice.id);
      
      let itemsData: Record<string, any[]> = {};
      
      if (invoiceIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('invoice_items')
          .select('*')
          .in('invoice_id', invoiceIds);
        
        if (itemsError) {
          console.error('Error fetching invoice items:', itemsError);
        } else if (items) {
          // Group items by invoice_id
          itemsData = items.reduce((acc: Record<string, any[]>, item) => {
            if (!acc[item.invoice_id]) {
              acc[item.invoice_id] = [];
            }
            acc[item.invoice_id].push(item);
            return acc;
          }, {});
        }
      }
      
      // Now combine all the data
      const enrichedInvoices = invoicesData.map(invoice => {
        // Find client for this invoice
        const client = clientsData.find(c => c.id === invoice.client_id) || null;
        
        // Get items for this invoice
        const items = itemsData[invoice.id] || [];
        
        return {
          ...invoice,
          clients: client,
          invoice_items: items
        };
      });
      
      return { 
        data: enrichedInvoices, 
        count: count || 0, 
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page,
        error: null 
      };
    }
  } catch (error: any) {
    console.error('Error searching invoices:', error);
    return { data: [], count: 0, error: error.message };
  }
};

testConnection();