
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { HelpCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FAQSection } from '@/components/faq-section'

export function FloatingFAQButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating FAQ Button - Fixed position in bottom right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-24 right-6 z-40"
        style={{ position: 'fixed' }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full w-14 h-14 shadow-lg hover-glow"
          title="Frequently Asked Questions"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* FAQ Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-effect border-white/20 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-center text-2xl">
              Frequently Asked Questions
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <FAQSection />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
