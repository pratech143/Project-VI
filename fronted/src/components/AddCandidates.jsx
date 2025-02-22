import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";

const posts = [
  { id: 1, name: "Mayor" },
  { id: 2, name: "Deputy Mayor" },
  { id: 3, name: "Ward Member" },
  { id: 4, name: "Ward Chairperson" },
];

export default function AddCandidates() {
  const [step, setStep] = useState(0);
  const [candidates, setCandidates] = useState({});
  const [form, setForm] = useState({ name: "", party: "" });
  const [isOpen, setIsOpen] = useState(false);

  const currentPost = posts[step];

  const addCandidate = () => {
    if (!form.name || !form.party) return;
    setCandidates((prev) => ({
      ...prev,
      [currentPost.id]: [...(prev[currentPost.id] || []), form],
    }));
    setForm({ name: "", party: "" });
  };

  const nextStep = () => {
    if (step < posts.length - 1) {
      setStep(step + 1);
    } else {
      console.log("Final Candidate List:", candidates);
      setIsOpen(false);
    }
  };

  return (
    <div className="p-4">
     
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold mb-2">Add Candidates for {currentPost.name}</h2>
            <Card className="p-4 mb-4">
              <CardContent>
                <Input
                  placeholder="Candidate Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mb-2"
                />
                <Input
                  placeholder="Party Name"
                  value={form.party}
                  onChange={(e) => setForm({ ...form, party: e.target.value })}
                  className="mb-2"
                />
                <Input
                  placeholder="locationid"
                  value={form.party}
                  onChange={(e) => setForm({ ...form, party: e.target.value })}
                  className="mb-2"
                />
                <Input
                  placeholder="ward"
                  value={form.party}
                  onChange={(e) => setForm({ ...form, party: e.target.value })}
                  className="mb-2"
                />
                <Button onClick={addCandidate}>Add Candidate</Button>
              </CardContent>
            </Card>
            <div className="mb-4">
              <h3 className="font-bold">Candidates for {currentPost.name}:</h3>
              <ul>
                {(candidates[currentPost.id] || []).map((c, index) => (
                  <li key={index}>{c.name} ({c.party})</li>
                ))}
              </ul>
            </div>
            <Button onClick={nextStep} className="mt-2">
              {step < posts.length - 1 ? "Next Post" : "Finish"}
            </Button>
          </motion.div>
    
    </div>
  );
}
