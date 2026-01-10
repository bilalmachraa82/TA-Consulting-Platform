'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, Home, Presentation, BarChart3, Tag, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

export function MobileMenu() {
    const [open, setOpen] = useState(false)

    return (
        <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-6 w-6 text-gray-700" />
                        <span className="sr-only">Abrir menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                        <SheetTitle className="text-left font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">TA</span>
                            </div>
                            TA Consulting
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-4 py-6">
                        <Link
                            href="/"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-2 py-2 text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            Início
                        </Link>
                        <Link
                            href="/apresentacao"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-2 py-2 text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            <Presentation className="w-5 h-5" />
                            Apresentação
                        </Link>
                        <Link
                            href="/diagnostico-fundos"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-2 py-2 text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            <Sparkles className="w-5 h-5" />
                            Diagnóstico Grátis
                        </Link>
                        <Link
                            href="/pricing"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-2 py-2 text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            <Tag className="w-5 h-5" />
                            Preços
                        </Link>
                        <Separator className="my-2" />
                        <Link
                            href="/dashboard"
                            onClick={() => setOpen(false)}
                        >
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start gap-3" size="lg">
                                <BarChart3 className="w-5 h-5" />
                                Aceder ao Dashboard
                            </Button>
                        </Link>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
