
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { QuoteList } from "@/entities/QuoteList";
import { QuoteItem } from "@/entities/QuoteItem";
import { SendEmail, InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function EmailSend() {
  const [user, setUser] = useState(null);
  const [quoteList, setQuoteList] = useState(null);
  const [items, setItems] = useState([]);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const generateBasicEmail = useCallback((list, itemsList, userData) => {
    const itemsText = itemsList.map(item =>
      `- ${item.product_name}: ${item.quantity} ${item.unit} @ $${item.unit_price?.toFixed(2)}`
    ).join('\n');

    const total = itemsList.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    const emailBody = `Hello,

I'm requesting a quote for the following materials for ${list.name}:

${itemsText}

Estimated Total: $${total.toFixed(2)}

Please provide your best pricing and availability.

Thank you,
${userData?.full_name || 'Customer'}
${userData?.company_name || ''}`;

    setBody(emailBody);
  }, []); // generateBasicEmail does not depend on any state from its closure once userData is passed as an argument.

  const loadData = useCallback(async () => {
    const userData = await User.me();
    setUser(userData);

    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get("list_id");

    if (listId) {
      const lists = await QuoteList.list();
      const list = lists.find(l => l.id === listId);
      if (list) {
        setQuoteList(list);
        setSubject(`RFQ: ${list.name}`);

        const itemsData = await QuoteItem.filter({ quote_list_id: listId });
        setItems(itemsData);

        generateBasicEmail(list, itemsData, userData); // Pass userData here
      }
    }
  }, [generateBasicEmail]); // loadData depends on generateBasicEmail

  useEffect(() => {
    loadData();
  }, [loadData]); // useEffect depends on loadData

  const hasAIAccess = user?.subscription_tier === "Pro" || user?.subscription_tier === "Enterprise";

  const handleGenerateAI = async () => {
    if (!hasAIAccess || !quoteList) return;

    setAiLoading(true);
    try {
      const itemsList = items.map(i =>
        `${i.product_name} (${i.quantity} ${i.unit})`
      ).join(', ');

      const result = await InvokeLLM({
        prompt: `Generate a professional RFQ (Request for Quote) email for an electrical contractor.
        Project: ${quoteList.name}
        Items needed: ${itemsList}

        Make it professional, clear, and include request for pricing and lead times.
        Sign it from ${user?.full_name || 'the contractor'}.`,
        response_json_schema: {
          type: "object",
          properties: {
            email_body: { type: "string" }
          }
        }
      });

      if (result.email_body) {
        setBody(result.email_body);
      }
    } catch (error) {
      console.error("AI email generation error:", error);
    }
    setAiLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await SendEmail({
        to,
        subject,
        body,
        from_name: user?.full_name
      });

      if (quoteList) {
        await QuoteList.update(quoteList.id, { status: "sent" });
      }

      setSent(true);
    } catch (error) {
      console.error("Error sending email:", error);
    }

    setSending(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="max-w-md border-green-200 bg-gradient-to-br from-green-50 to-white shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Email Sent!</h2>
              <p className="text-slate-600 mb-6">Your RFQ has been sent successfully</p>
              <Button onClick={() => window.history.back()} className="bg-green-600 hover:bg-green-700">
                Back to Quote Lists
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Send RFQ
          </h1>
          <p className="text-slate-600 mt-2">Request quotes from suppliers</p>
        </div>

        <form onSubmit={handleSend} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">To (Email Address) *</label>
                <Input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="supplier@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Subject *</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Request for Quote"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className={hasAIAccess ? "border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Email Message</CardTitle>
                {hasAIAccess && (
                  <Button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={aiLoading || !quoteList}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    {aiLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Generate
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={15}
                className="font-mono text-sm"
                placeholder="Enter your message..."
                required
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sending || !to || !subject || !body}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
